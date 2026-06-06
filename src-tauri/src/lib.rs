mod commands;
mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::file::scan_folder,
            commands::file::read_file,
            commands::file::write_file,
            commands::file::write_binary_file,
            commands::preferences::get_preferences,
            commands::preferences::save_preferences,
            commands::preferences::add_recent_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
