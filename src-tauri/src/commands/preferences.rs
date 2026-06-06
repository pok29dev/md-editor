use crate::models::AppPreferences;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

const MAX_RECENT: usize = 10;

fn preferences_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Cannot resolve config dir: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("Cannot create config dir: {e}"))?;
    Ok(dir.join("preferences.json"))
}

fn load_preferences(app: &tauri::AppHandle) -> Result<AppPreferences, String> {
    let path = preferences_path(app)?;
    if !path.exists() {
        return Ok(AppPreferences::default());
    }
    let data = fs::read_to_string(&path).map_err(|e| format!("Cannot read preferences: {e}"))?;
    serde_json::from_str(&data).map_err(|e| format!("Invalid preferences: {e}"))
}

fn store_preferences(app: &tauri::AppHandle, prefs: &AppPreferences) -> Result<(), String> {
    let path = preferences_path(app)?;
    let data =
        serde_json::to_string_pretty(prefs).map_err(|e| format!("Cannot serialize: {e}"))?;
    fs::write(&path, data).map_err(|e| format!("Cannot write preferences: {e}"))
}

#[tauri::command]
pub fn get_preferences(app: tauri::AppHandle) -> Result<AppPreferences, String> {
    load_preferences(&app)
}

#[tauri::command]
pub fn save_preferences(app: tauri::AppHandle, prefs: AppPreferences) -> Result<(), String> {
    store_preferences(&app, &prefs)
}

#[tauri::command]
pub fn add_recent_folder(app: tauri::AppHandle, path: String) -> Result<AppPreferences, String> {
    let mut prefs = load_preferences(&app)?;
    prefs.recent_folders.retain(|p| p != &path);
    prefs.recent_folders.insert(0, path.clone());
    prefs.recent_folders.truncate(MAX_RECENT);
    prefs.last_open_folder = Some(path);
    store_preferences(&app, &prefs)?;
    Ok(prefs)
}
