use crate::models::{FileContent, FolderTree, TreeNode};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

const MD_EXTENSIONS: &[&str] = &["md", "markdown"];

fn is_markdown_file(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| MD_EXTENSIONS.contains(&e.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
}

fn dir_has_markdown(dir: &Path) -> Result<bool, String> {
    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            if dir_has_markdown(&path)? {
                return Ok(true);
            }
        } else if is_markdown_file(&path) {
            return Ok(true);
        }
    }
    Ok(false)
}

fn build_tree(dir: &Path, root: &Path) -> Result<Vec<TreeNode>, String> {
    let mut nodes = Vec::new();
    let entries = fs::read_dir(dir).map_err(|e| format!("Cannot read {}: {e}", dir.display()))?;

    let mut items: Vec<PathBuf> = entries
        .filter_map(|e| e.ok().map(|e| e.path()))
        .collect();

    items.sort_by(|a, b| {
        let a_is_dir = a.is_dir();
        let b_is_dir = b.is_dir();
        match (a_is_dir, b_is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.file_name().cmp(&b.file_name()),
        }
    });

    for path in items {
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        if path.is_dir() {
            if dir_has_markdown(&path)? {
                let children = build_tree(&path, root)?;
                nodes.push(TreeNode {
                    name,
                    path: path.to_string_lossy().to_string(),
                    node_type: "folder".to_string(),
                    children: Some(children),
                });
            }
        } else if is_markdown_file(&path) {
            nodes.push(TreeNode {
                name,
                path: path.to_string_lossy().to_string(),
                node_type: "file".to_string(),
                children: None,
            });
        }
    }

    Ok(nodes)
}

#[tauri::command]
pub fn scan_folder(path: String) -> Result<FolderTree, String> {
    let root = PathBuf::from(&path);
    if !root.is_dir() {
        return Err(format!("Not a directory: {path}"));
    }

    let nodes = build_tree(&root, &root)?;
    Ok(FolderTree {
        root: path,
        nodes,
    })
}

#[tauri::command]
pub fn read_file(path: String) -> Result<FileContent, String> {
    let file_path = PathBuf::from(&path);
    if !file_path.is_file() {
        return Err(format!("File not found: {path}"));
    }

    let bytes = fs::read(&file_path).map_err(|e| format!("Cannot read file: {e}"))?;

    let (encoding, content_bytes) = if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        ("utf-8-bom", &bytes[3..])
    } else {
        ("utf-8", bytes.as_slice())
    };

    let content = String::from_utf8(content_bytes.to_vec())
        .map_err(|e| format!("Invalid UTF-8: {e}"))?;

    let modified_at = fs::metadata(&file_path)
        .ok()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);

    Ok(FileContent {
        path,
        content,
        encoding: encoding.to_string(),
        modified_at,
    })
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    write_bytes(path, content.as_bytes())
}

#[tauri::command]
pub fn write_binary_file(path: String, data: Vec<u8>) -> Result<(), String> {
    write_bytes(path, &data)
}

fn write_bytes(path: String, data: &[u8]) -> Result<(), String> {
    let file_path = PathBuf::from(&path);
    let parent = file_path
        .parent()
        .ok_or_else(|| "Invalid file path".to_string())?;

    fs::create_dir_all(parent).map_err(|e| format!("Cannot create directory: {e}"))?;

    let file_name = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| "Invalid file name".to_string())?;
    let tmp_path = parent.join(format!("{file_name}.tmp"));
    {
        let mut file =
            fs::File::create(&tmp_path).map_err(|e| format!("Cannot create temp file: {e}"))?;
        file.write_all(data)
            .map_err(|e| format!("Cannot write file: {e}"))?;
        file.sync_all()
            .map_err(|e| format!("Cannot sync file: {e}"))?;
    }

    fs::rename(&tmp_path, &file_path).map_err(|e| format!("Cannot save file: {e}"))?;
    Ok(())
}
