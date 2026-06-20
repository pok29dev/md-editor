mod commands;
mod models;

use std::sync::Mutex;
#[cfg(any(windows, target_os = "linux"))]
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager, RunEvent};

use commands::thclaws::ThclawsServeManager;

struct PendingOpenFiles(Mutex<Vec<String>>);

fn paths_from_urls(urls: Vec<tauri::Url>) -> Vec<String> {
    urls.into_iter()
        .filter_map(|url| url.to_file_path().ok())
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

#[cfg(any(windows, target_os = "linux"))]
fn path_from_cli_arg(arg: &str) -> Option<PathBuf> {
    if arg.starts_with('-') {
        return None;
    }

    if let Ok(url) = tauri::Url::parse(arg) {
        if url.scheme() == "file" {
            return url.to_file_path().ok();
        }
        return None;
    }

    Some(PathBuf::from(arg))
}

#[cfg(any(windows, target_os = "linux"))]
fn queue_cli_open_files(app: &tauri::App) {
    let files = std::env::args()
        .skip(1)
        .filter_map(|arg| path_from_cli_arg(&arg))
        .map(|path| path.to_string_lossy().into_owned())
        .collect::<Vec<_>>();

    queue_open_files(&app.handle(), files);
}

fn focused_webview_window(app: &AppHandle) -> Option<tauri::WebviewWindow> {
    app.webview_windows()
        .into_values()
        .find(|window| window.is_focused().unwrap_or(false))
}

fn queue_open_files(app: &AppHandle, paths: Vec<String>) {
    if paths.is_empty() {
        return;
    }

    if let Some(focused) = focused_webview_window(app) {
        let _ = focused.emit("open-file", &paths);
        return;
    }

    if let Some(main) = app.get_webview_window("main") {
        let _ = main.emit("open-file", &paths);
        return;
    }

    let state = app.state::<PendingOpenFiles>();
    let mut pending = state.0.lock().unwrap();
    pending.extend(paths);
}

#[tauri::command]
fn get_pending_open_files(window: tauri::WebviewWindow, app: tauri::AppHandle) -> Vec<String> {
    if window.label() != "main" {
        return Vec::new();
    }

    let state = app.state::<PendingOpenFiles>();
    let mut pending = state.0.lock().unwrap();
    std::mem::take(&mut *pending)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(PendingOpenFiles(Mutex::new(vec![])))
        .manage(ThclawsServeManager::new())
        .setup(|app| {
            #[cfg(any(windows, target_os = "linux"))]
            queue_cli_open_files(app);
            #[cfg(not(any(windows, target_os = "linux")))]
            let _: &tauri::App = app;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::file::scan_folder,
            commands::file::read_file,
            commands::file::write_file,
            commands::file::write_binary_file,
            commands::preferences::get_preferences,
            commands::preferences::save_preferences,
            commands::preferences::add_recent_folder,
            commands::thclaws::detect_thclaws,
            commands::thclaws::get_thclaws_config_dir,
            commands::thclaws::get_thclaws_workspace_dir,
            commands::thclaws::open_thclaws_workspace_dir,
            commands::thclaws::open_thclaws_project_config_dir,
            commands::thclaws::open_thclaws_user_config_dir,
            commands::thclaws::start_thclaws_serve,
            commands::thclaws::stop_thclaws_serve,
            commands::thclaws::get_thclaws_serve_status,
            commands::thclaws::test_thclaws_connection,
            commands::thclaws::run_thclaws_structure,
            get_pending_open_files,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app, event| {
            if matches!(event, RunEvent::Exit) {
                if let Some(manager) = app.try_state::<ThclawsServeManager>() {
                    manager.stop();
                }
            }

            #[cfg(any(
                target_os = "macos",
                target_os = "ios",
                target_os = "android"
            ))]
            if let tauri::RunEvent::Opened { urls } = event {
                queue_open_files(app, paths_from_urls(urls));
            }
        });
}
