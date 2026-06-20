use serde::Serialize;
use std::fs;
use std::io::{Read, Write};
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};

const MAX_INPUT_CHARS: usize = 32_000;
const SERVE_PORT_BASE: u16 = 18_443;
const SERVE_PORT_SPAN: u16 = 200;
const SERVE_START_TIMEOUT: Duration = Duration::from_secs(90);
const RUN_TIMEOUT: Duration = Duration::from_secs(120);
const DISALLOWED_TOOLS: &str =
    "Write,Edit,Bash,WebFetch,WebSearch,Task,Glob,Grep,Ls,Read";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThclawsDetectResult {
    pub found: bool,
    pub path: Option<String>,
    pub version: Option<String>,
    pub message: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThclawsTestResult {
    pub ok: bool,
    pub message: String,
    pub sample: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThclawsStructureResult {
    pub markdown: String,
    pub stderr: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThclawsServeStartResult {
    pub port: u16,
    pub url: String,
    pub working_dir: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThclawsServeStatus {
    pub running: bool,
    pub port: Option<u16>,
    pub url: Option<String>,
    pub working_dir: Option<String>,
}

struct ServeInner {
    child: Option<Child>,
    working_dir: Option<PathBuf>,
    port: Option<u16>,
}

pub struct ThclawsServeManager {
    inner: Mutex<ServeInner>,
}

impl ThclawsServeManager {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(ServeInner {
                child: None,
                working_dir: None,
                port: None,
            }),
        }
    }

    pub fn stop(&self) {
        let mut inner = self.inner.lock().expect("serve manager lock");
        stop_serve_inner(&mut inner);
    }

    pub fn status(&self) -> ThclawsServeStatus {
        let mut inner = self.inner.lock().expect("serve manager lock");
        reconcile_serve_child(&mut inner);
        serve_status_from_inner(&inner)
    }

    pub fn start(
        &self,
        working_dir: PathBuf,
        binary: PathBuf,
    ) -> Result<ThclawsServeStartResult, String> {
        let mut inner = self.inner.lock().expect("serve manager lock");
        reconcile_serve_child(&mut inner);

        if inner.child.is_some() {
            if inner.working_dir.as_ref() == Some(&working_dir) {
                let port = inner.port.ok_or_else(|| {
                    "thClaws serve is running but port is unknown.".to_string()
                })?;
                return Ok(ThclawsServeStartResult {
                    port,
                    url: serve_url(port),
                    working_dir: working_dir.to_string_lossy().into_owned(),
                });
            }
            stop_serve_inner(&mut inner);
        }

        let port = find_available_serve_port()?;
        let mut child = configure_thclaws_command(&binary, &working_dir)
            .arg("--serve")
            .arg("--no-scheduler")
            .arg("--port")
            .arg(port.to_string())
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start thClaws serve: {e}"))?;

        if let Err(message) = wait_for_serve_ready(&mut child, port, SERVE_START_TIMEOUT) {
            let _ = child.kill();
            let _ = child.wait();
            return Err(message);
        }

        inner.child = Some(child);
        inner.working_dir = Some(working_dir.clone());
        inner.port = Some(port);

        Ok(ThclawsServeStartResult {
            port,
            url: serve_url(port),
            working_dir: working_dir.to_string_lossy().into_owned(),
        })
    }
}

fn serve_url(port: u16) -> String {
    format!("http://127.0.0.1:{port}/")
}

fn serve_status_from_inner(inner: &ServeInner) -> ThclawsServeStatus {
    let running = inner.child.is_some();
    ThclawsServeStatus {
        running,
        port: inner.port,
        url: inner.port.map(serve_url),
        working_dir: inner
            .working_dir
            .as_ref()
            .map(|path| path.to_string_lossy().into_owned()),
    }
}

fn reconcile_serve_child(inner: &mut ServeInner) {
    let Some(child) = inner.child.as_mut() else {
        return;
    };
    match child.try_wait() {
        Ok(Some(_)) => {
            inner.child = None;
            inner.working_dir = None;
            inner.port = None;
        }
        Ok(None) => {}
        Err(_) => {
            inner.child = None;
            inner.working_dir = None;
            inner.port = None;
        }
    }
}

fn stop_serve_inner(inner: &mut ServeInner) {
    if let Some(mut child) = inner.child.take() {
        let _ = child.kill();
        let _ = child.wait();
    }
    inner.working_dir = None;
    inner.port = None;
}

fn find_available_serve_port() -> Result<u16, String> {
    for offset in 0..SERVE_PORT_SPAN {
        let port = SERVE_PORT_BASE.saturating_add(offset);
        if TcpListener::bind(("127.0.0.1", port)).is_ok() {
            return Ok(port);
        }
    }
    Err(format!(
        "No free port between {SERVE_PORT_BASE} and {}.",
        SERVE_PORT_BASE.saturating_add(SERVE_PORT_SPAN - 1)
    ))
}

fn read_child_stderr(child: &mut Child) -> Option<String> {
    let stderr = child.stderr.take()?;
    let mut buf = String::new();
    let mut handle = stderr;
    let _ = handle.read_to_string(&mut buf);
    let trimmed = strip_ansi(buf.trim());
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

fn child_exit_message(child: &mut Child) -> String {
    read_child_stderr(child).unwrap_or_else(|| {
        "thClaws exited before the web UI was ready.".to_string()
    })
}

fn probe_serve_http(port: u16) -> bool {
    let addr: SocketAddr = match format!("127.0.0.1:{port}").parse() {
        Ok(addr) => addr,
        Err(_) => return false,
    };
    let Ok(mut stream) = TcpStream::connect_timeout(&addr, Duration::from_millis(800)) else {
        return false;
    };
    let request = format!(
        "GET / HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\nConnection: close\r\n\r\n"
    );
    if stream.write_all(request.as_bytes()).is_err() {
        return false;
    }
    let mut buf = [0u8; 512];
    let Ok(n) = stream.read(&mut buf) else {
        return false;
    };
    if n == 0 {
        return false;
    }
    let response = String::from_utf8_lossy(&buf[..n]);
    response.contains(" 200 ")
        || response.starts_with("HTTP/1.1 200")
        || response.starts_with("HTTP/1.0 200")
        || response.contains(" 304 ")
}

fn wait_for_serve_ready(
    child: &mut Child,
    port: u16,
    timeout: Duration,
) -> Result<(), String> {
    let started = Instant::now();
    while started.elapsed() < timeout {
        match child.try_wait() {
            Ok(Some(_)) => return Err(child_exit_message(child)),
            Ok(None) => {}
            Err(err) => {
                return Err(format!("Failed while waiting for thClaws serve: {err}"));
            }
        }

        if probe_serve_http(port) {
            match child.try_wait() {
                Ok(Some(_)) => return Err(child_exit_message(child)),
                Ok(None) => return Ok(()),
                Err(err) => {
                    return Err(format!("Failed while waiting for thClaws serve: {err}"));
                }
            }
        }

        thread::sleep(Duration::from_millis(300));
    }

    let _ = child.kill();
    Err(format!(
        "thClaws web UI did not respond on port {port} within {} seconds. \
         If a previous thClaws is still running, stop it and try again.",
        timeout.as_secs()
    ))
}

fn resolve_working_dir(working_dir: &str) -> Result<PathBuf, String> {
    let trimmed = working_dir.trim();
    if trimmed.is_empty() {
        return Err("Open a folder in md-editor first.".to_string());
    }
    let path = PathBuf::from(trimmed);
    if !path.is_dir() {
        return Err(format!(
            "Working directory does not exist: {}",
            path.display()
        ));
    }
    Ok(path)
}

fn ensure_project_thclaws_dir(working_dir: &Path) -> Result<PathBuf, String> {
    let thclaws_dir = working_dir.join(".thclaws");
    fs::create_dir_all(&thclaws_dir).map_err(|e| {
        format!(
            "Cannot create .thclaws at {}: {e}",
            thclaws_dir.display()
        )
    })?;
    Ok(thclaws_dir)
}

fn strip_ansi(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut chars = text.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '\u{1b}' {
            while let Some(next) = chars.next() {
                if next == 'm' {
                    break;
                }
            }
            continue;
        }
        result.push(ch);
    }
    result
}

fn resolve_thclaws_binary(custom_path: Option<String>) -> Result<PathBuf, String> {
    if let Some(path) = custom_path {
        let trimmed = path.trim();
        if trimmed.is_empty() {
            return resolve_thclaws_from_path();
        }
        let candidate = PathBuf::from(trimmed);
        if !candidate.is_file() {
            return Err(format!("thClaws not found at {trimmed}"));
        }
        return Ok(candidate);
    }
    resolve_thclaws_from_path()
}

fn enrich_path() -> Option<std::ffi::OsString> {
    let mut dirs: Vec<PathBuf> = Vec::new();
    if let Ok(home) = std::env::var("HOME") {
        dirs.push(PathBuf::from(&home).join(".local").join("bin"));
        dirs.push(PathBuf::from(&home).join("bin"));
    }
    if cfg!(target_os = "macos") {
        dirs.push(PathBuf::from("/opt/homebrew/bin"));
        dirs.push(PathBuf::from("/usr/local/bin"));
    }
    if let Some(existing) = std::env::var_os("PATH") {
        dirs.extend(std::env::split_paths(&existing));
    }
    dirs.push(PathBuf::from("/usr/bin"));
    dirs.push(PathBuf::from("/bin"));

    let mut seen = std::collections::HashSet::new();
    let mut unique = Vec::new();
    for dir in dirs {
        if seen.insert(dir.clone()) {
            unique.push(dir);
        }
    }
    std::env::join_paths(unique).ok()
}

fn resolve_thclaws_from_path() -> Result<PathBuf, String> {
    let path_var = enrich_path().ok_or_else(|| "PATH is not set".to_string())?;
    for dir in std::env::split_paths(&path_var) {
        let candidate = dir.join(if cfg!(windows) { "thclaws.exe" } else { "thclaws" });
        if candidate.is_file() {
            return Ok(candidate);
        }
    }
    Err("thClaws was not found in PATH. Install thClaws or set a custom path in Settings.".to_string())
}

fn run_thclaws_command(
    binary: &Path,
    working_dir: &Path,
    args: &[&str],
) -> Result<(String, String, i32), String> {
    let mut child = configure_thclaws_command(binary, working_dir)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start thClaws: {e}"))?;

    let stdout_handle = child.stdout.take();
    let stderr_handle = child.stderr.take();

    let stdout_thread = thread::spawn(move || {
        let mut buf = String::new();
        if let Some(mut stdout) = stdout_handle {
            let _ = stdout.read_to_string(&mut buf);
        }
        buf
    });

    let stderr_thread = thread::spawn(move || {
        let mut buf = String::new();
        if let Some(mut stderr) = stderr_handle {
            let _ = stderr.read_to_string(&mut buf);
        }
        buf
    });

    let started = Instant::now();
    loop {
        match child
            .try_wait()
            .map_err(|e| format!("Failed while waiting for thClaws: {e}"))?
        {
            Some(status) => {
                let stdout = stdout_thread.join().unwrap_or_default();
                let stderr = stderr_thread.join().unwrap_or_default();
                return Ok((stdout, stderr, status.code().unwrap_or(-1)));
            }
            None => {
                if started.elapsed() >= RUN_TIMEOUT {
                    let _ = child.kill();
                    let _ = child.wait();
                    return Err("thClaws timed out after 120 seconds.".to_string());
                }
                thread::sleep(Duration::from_millis(200));
            }
        }
    }
}

fn format_thclaws_failure(stdout: &str, stderr: &str, code: i32) -> String {
    let stderr = strip_ansi(stderr.trim());
    if !stderr.is_empty() {
        return stderr.to_string();
    }
    let stdout = strip_ansi(stdout.trim());
    if !stdout.is_empty() {
        return stdout.to_string();
    }
    format!("thClaws exited with code {code}.")
}

fn configure_thclaws_command(binary: &Path, working_dir: &Path) -> Command {
    let mut command = Command::new(binary);
    command.current_dir(working_dir);
    if let Some(path) = enrich_path() {
        command.env("PATH", path);
    }
    if let Ok(home) = std::env::var("HOME") {
        command.env("HOME", home);
    }
    command
}

fn build_thclaws_args(
    prompt: &str,
    use_defaults: bool,
    model: &str,
) -> Result<Vec<String>, String> {
    let mut args = vec!["-p".to_string(), prompt.to_string()];
    if use_defaults {
        // Omit -m — thClaws uses ~/.config/thclaws/settings.json + keychain/.env
    } else {
        let model = model.trim();
        if model.is_empty() {
            return Err("Model is required when not using thClaws defaults.".to_string());
        }
        args.push("-m".to_string());
        args.push(model.to_string());
    }
    args.extend([
        "--permission-mode".to_string(),
        "auto".to_string(),
        "--max-iterations".to_string(),
        "1".to_string(),
        "--disallowed-tools".to_string(),
        DISALLOWED_TOOLS.to_string(),
    ]);
    Ok(args)
}

fn run_thclaws_with_prompt(
    binary: &Path,
    working_dir: &Path,
    prompt: &str,
    use_defaults: bool,
    model: &str,
) -> Result<(String, String, i32), String> {
    let args = build_thclaws_args(prompt, use_defaults, model)?;
    let arg_refs: Vec<&str> = args.iter().map(String::as_str).collect();
    run_thclaws_command(binary, working_dir, &arg_refs)
}

fn build_structure_prompt(content: &str) -> String {
    format!(
        "Convert the INPUT text (often a Thai social media post) to structured GitHub Flavored Markdown.\n\
Preserve meaning. Use headings, blockquotes, horizontal rules, lists, and fenced code blocks where appropriate.\n\
Output ONLY the final markdown body. No preamble, explanation, reasoning, or meta-commentary.\n\
Begin the reply with the first markdown line (heading, blockquote, or list item).\n\n\
---INPUT---\n\
{content}\n\
---END---"
    )
}

fn is_thclaws_noise_line(line: &str) -> bool {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return false;
    }
    trimmed.starts_with("[mcp]")
        || trimmed.contains(" tool(s)")
        || trimmed.starts_with("[retry ")
        || (trimmed.starts_with("The user ") && trimmed.contains("want"))
        || trimmed.starts_with("Let me ")
        || trimmed.starts_with("I'll ")
        || trimmed.starts_with("I will ")
        || trimmed.starts_with("I need to ")
        || trimmed.starts_with("Here is the ")
        || trimmed.starts_with("Here's the ")
}

fn is_markdown_content_line(line: &str) -> bool {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return false;
    }
    trimmed.starts_with('#')
        || trimmed.starts_with('>')
        || trimmed.starts_with("- ")
        || trimmed.starts_with("* ")
        || trimmed.starts_with("+ ")
        || trimmed.starts_with("```")
        || trimmed.starts_with('|')
        || trimmed.starts_with("---")
        || trimmed.starts_with("***")
        || is_numbered_list_line(trimmed)
}

fn is_numbered_list_line(line: &str) -> bool {
    let mut chars = line.chars();
    let mut saw_digit = false;
    while let Some(ch) = chars.next() {
        if ch.is_ascii_digit() {
            saw_digit = true;
            continue;
        }
        if (ch == '.' || ch == ')') && saw_digit {
            return chars.next().is_some_and(|next| next.is_whitespace());
        }
        break;
    }
    false
}

fn extract_fenced_markdown(text: &str) -> Option<String> {
    for opener in ["```markdown\n", "```md\n", "```\n"] {
        if let Some(start) = text.find(opener) {
            let rest = &text[start + opener.len()..];
            if let Some(end) = rest.find("\n```") {
                let body = rest[..end].trim();
                if !body.is_empty() {
                    return Some(body.to_string());
                }
            }
        }
    }
    None
}

fn strip_leading_noise(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    if let Some(start) = lines
        .iter()
        .position(|line| is_markdown_content_line(line))
    {
        return lines[start..].join("\n").trim().to_string();
    }

    let mut kept = Vec::new();
    let mut skipping = true;
    for line in lines {
        if skipping {
            if is_thclaws_noise_line(line) || line.trim().is_empty() {
                continue;
            }
            skipping = false;
        }
        kept.push(line);
    }
    kept.join("\n").trim().to_string()
}

fn extract_markdown_response(text: &str) -> String {
    let cleaned = strip_ansi(text).trim().to_string();
    if let Some(fenced) = extract_fenced_markdown(&cleaned) {
        return strip_leading_noise(&fenced);
    }

    if let Some(rest) = cleaned.strip_prefix("```markdown") {
        if let Some(body) = rest.strip_suffix("```") {
            return strip_leading_noise(body.trim());
        }
    }
    if let Some(rest) = cleaned.strip_prefix("```md") {
        if let Some(body) = rest.strip_suffix("```") {
            return strip_leading_noise(body.trim());
        }
    }
    if cleaned.starts_with("```") && cleaned.ends_with("```") && cleaned.len() >= 6 {
        let inner = &cleaned[3..cleaned.len() - 3];
        if let Some(body) = inner.find('\n').map(|index| inner[index + 1..].trim()) {
            if !body.is_empty() {
                return strip_leading_noise(body);
            }
        }
    }

    strip_leading_noise(&cleaned)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_working_dir_rejects_empty() {
        assert!(resolve_working_dir("  ").is_err());
    }

    #[test]
    fn strips_mcp_and_reasoning_before_blockquote() {
        let raw = "[mcp] browser … 29 tool(s)\n\
The user wants me to convert a Thai social media post into structured GitHub Flavored Markdown. Let me parse the content and format it properly.\n\n\
> \"ลองไปดูคลิปตัวอย่างใหม่ในกลุ่มได้ครับ\"\n\n\
## เริ่มต้นจากเว็บ investneet.com";
        let out = extract_markdown_response(raw);
        assert!(out.starts_with("> \"ลองไปดูคลิป"));
        assert!(!out.contains("[mcp]"));
        assert!(!out.contains("The user wants"));
    }
}

#[tauri::command]
pub fn detect_thclaws(custom_path: Option<String>) -> ThclawsDetectResult {
    match resolve_thclaws_binary(custom_path) {
        Ok(path) => {
            let output = Command::new(&path)
                .arg("--version")
                .output();
            match output {
                Ok(out) if out.status.success() => {
                    let version = strip_ansi(&String::from_utf8_lossy(&out.stdout))
                        .trim()
                        .to_string();
                    ThclawsDetectResult {
                        found: true,
                        path: Some(path.to_string_lossy().into_owned()),
                        version: if version.is_empty() {
                            None
                        } else {
                            Some(version)
                        },
                        message: "thClaws detected.".to_string(),
                    }
                }
                Ok(out) => ThclawsDetectResult {
                    found: true,
                    path: Some(path.to_string_lossy().into_owned()),
                    version: None,
                    message: strip_ansi(&String::from_utf8_lossy(&out.stderr)).trim().to_string(),
                },
                Err(err) => ThclawsDetectResult {
                    found: true,
                    path: Some(path.to_string_lossy().into_owned()),
                    version: None,
                    message: format!("thClaws found but --version failed: {err}"),
                },
            }
        }
        Err(message) => ThclawsDetectResult {
            found: false,
            path: None,
            version: None,
            message,
        },
    }
}

fn open_path_in_file_manager(path: &Path) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(path).map_err(|e| {
            format!(
                "Cannot create folder at {}: {e}",
                path.display()
            )
        })?;
    }

    #[cfg(target_os = "macos")]
    {
        let status = std::process::Command::new("open")
            .arg(path)
            .status()
            .map_err(|e| format!("Failed to open {}: {e}", path.display()))?;
        if status.success() {
            return Ok(());
        }
        return Err(format!("Failed to open {} in Finder.", path.display()));
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(path)
            .status()
            .map_err(|e| format!("Failed to open {}: {e}", path.display()))?
            .success()
            .then_some(())
            .ok_or_else(|| format!("Failed to open {} in Explorer.", path.display()))?;
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(path)
            .status()
            .map_err(|e| format!("Failed to open {}: {e}", path.display()))?
            .success()
            .then_some(())
            .ok_or_else(|| format!("Failed to open {}.", path.display()))?;
        return Ok(());
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        let _ = path;
        Err("Opening folders is not supported on this platform.".to_string())
    }
}

#[tauri::command]
pub fn get_thclaws_workspace_dir(working_dir: String) -> Result<String, String> {
    resolve_working_dir(&working_dir).map(|path| path.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn open_thclaws_workspace_dir(working_dir: String) -> Result<(), String> {
    let dir = resolve_working_dir(&working_dir)?;
    open_path_in_file_manager(&dir)
}

#[tauri::command]
pub fn open_thclaws_project_config_dir(working_dir: String) -> Result<(), String> {
    let dir = resolve_working_dir(&working_dir)?;
    let thclaws_dir = ensure_project_thclaws_dir(&dir)?;
    open_path_in_file_manager(&thclaws_dir)
}

#[tauri::command]
pub fn open_thclaws_user_config_dir() -> Result<(), String> {
    let dir = PathBuf::from(get_thclaws_config_dir()?);
    open_path_in_file_manager(&dir)
}

#[tauri::command]
pub fn get_thclaws_config_dir() -> Result<String, String> {
    if cfg!(windows) {
        if let Ok(appdata) = std::env::var("APPDATA") {
            return Ok(PathBuf::from(appdata)
                .join("thclaws")
                .to_string_lossy()
                .into_owned());
        }
    }

    if let Ok(home) = std::env::var("HOME") {
        return Ok(PathBuf::from(home)
            .join(".config")
            .join("thclaws")
            .to_string_lossy()
            .into_owned());
    }

    Err("Cannot resolve thClaws config directory.".to_string())
}

#[tauri::command]
pub fn start_thclaws_serve(
    manager: tauri::State<'_, ThclawsServeManager>,
    working_dir: String,
    custom_path: Option<String>,
) -> Result<ThclawsServeStartResult, String> {
    let workspace = resolve_working_dir(&working_dir)?;
    let _ = ensure_project_thclaws_dir(&workspace)?;
    let binary = resolve_thclaws_binary(custom_path)?;
    manager.start(workspace, binary)
}

#[tauri::command]
pub fn stop_thclaws_serve(manager: tauri::State<'_, ThclawsServeManager>) -> Result<(), String> {
    manager.stop();
    Ok(())
}

#[tauri::command]
pub fn get_thclaws_serve_status(
    manager: tauri::State<'_, ThclawsServeManager>,
) -> ThclawsServeStatus {
    manager.status()
}

#[tauri::command]
pub fn test_thclaws_connection(
    _app: tauri::AppHandle,
    working_dir: String,
    custom_path: Option<String>,
    use_thclaws_defaults: bool,
    model: String,
) -> ThclawsTestResult {
    if !use_thclaws_defaults {
        let model = model.trim();
        if model.is_empty() {
            return ThclawsTestResult {
                ok: false,
                message: "Model is required when not using thClaws defaults.".to_string(),
                sample: None,
            };
        }
    }

    let binary = match resolve_thclaws_binary(custom_path) {
        Ok(path) => path,
        Err(message) => {
            return ThclawsTestResult {
                ok: false,
                message,
                sample: None,
            };
        }
    };

    let workspace = match resolve_working_dir(&working_dir) {
        Ok(path) => path,
        Err(message) => {
            return ThclawsTestResult {
                ok: false,
                message,
                sample: None,
            };
        }
    };
    if let Err(message) = ensure_project_thclaws_dir(&workspace) {
        return ThclawsTestResult {
            ok: false,
            message,
            sample: None,
        };
    }

    match run_thclaws_with_prompt(
        &binary,
        &workspace,
        "Reply with exactly: OK",
        use_thclaws_defaults,
        &model,
    ) {
        Ok((stdout, stderr, code)) => {
            let sample = extract_markdown_response(&stdout);
            let ok = code == 0;
            let message = if ok {
                if use_thclaws_defaults {
                    "Connection successful (using thClaws defaults on this machine).".to_string()
                } else {
                    format!("Connection successful (model: {}).", model.trim())
                }
            } else {
                format_thclaws_failure(&stdout, &stderr, code)
            };
            ThclawsTestResult {
                ok,
                message,
                sample: if sample.is_empty() { None } else { Some(sample) },
            }
        }
        Err(message) => ThclawsTestResult {
            ok: false,
            message,
            sample: None,
        },
    }
}

#[tauri::command]
pub fn run_thclaws_structure(
    _app: tauri::AppHandle,
    working_dir: String,
    content: String,
    custom_path: Option<String>,
    use_thclaws_defaults: bool,
    model: String,
) -> Result<ThclawsStructureResult, String> {
    if content.trim().is_empty() {
        return Err("Nothing to structure.".to_string());
    }
    if content.chars().count() > MAX_INPUT_CHARS {
        return Err(format!(
            "Input is too long ({} chars). Maximum is {MAX_INPUT_CHARS} characters.",
            content.chars().count()
        ));
    }

    if !use_thclaws_defaults && model.trim().is_empty() {
        return Err("Model is required when not using thClaws defaults.".to_string());
    }

    let binary = resolve_thclaws_binary(custom_path)?;
    let workspace = resolve_working_dir(&working_dir)?;
    ensure_project_thclaws_dir(&workspace)?;
    let prompt = build_structure_prompt(&content);

    let (stdout, stderr, code) =
        run_thclaws_with_prompt(&binary, &workspace, &prompt, use_thclaws_defaults, &model)?;
    let markdown = extract_markdown_response(&stdout);
    if markdown.is_empty() {
        return Err(format_thclaws_failure(&stdout, &stderr, code));
    }

    Ok(ThclawsStructureResult {
        markdown,
        stderr: if stderr.trim().is_empty() {
            None
        } else {
            Some(strip_ansi(stderr.trim()))
        },
    })
}
