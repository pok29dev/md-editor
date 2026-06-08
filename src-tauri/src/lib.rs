mod commands;
mod models;

use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};

struct PendingOpenFiles(Mutex<Vec<String>>);

fn paths_from_urls(urls: Vec<tauri::Url>) -> Vec<String> {
    urls.into_iter()
        .filter_map(|url| url.to_file_path().ok())
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

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

fn queue_open_files(app: &AppHandle, paths: Vec<String>) {
    if paths.is_empty() {
        return;
    }

    {
        let state = app.state::<PendingOpenFiles>();
        let mut pending = state.0.lock().unwrap();
        pending.extend(paths.clone());
    }

    let _ = app.emit("open-file", paths);
}

#[tauri::command]
fn get_pending_open_files(app: tauri::AppHandle) -> Vec<String> {
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
        .setup(|app| {
            #[cfg(any(windows, target_os = "linux"))]
            {
                let files = std::env::args()
                    .skip(1)
                    .filter_map(|arg| path_from_cli_arg(&arg))
                    .map(|path| path.to_string_lossy().into_owned())
                    .collect::<Vec<_>>();

                queue_open_files(&app.handle(), files);
            }

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
            get_pending_open_files,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app, event| {
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
