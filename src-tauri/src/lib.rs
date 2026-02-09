mod ai;
mod commands;
mod db;
mod errors;
mod models;

use db::Database;
use std::path::PathBuf;

/// Get the default database path
fn get_db_path() -> PathBuf {
    let base = dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("recallsnippet");

    base.join("recallsnippet.db")
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Database::new(get_db_path()).expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(db)
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::create_snippet,
            commands::get_snippet,
            commands::list_snippets,
            commands::update_snippet,
            commands::delete_snippet,
            commands::list_tags,
            commands::create_tag,
            commands::delete_tag,
            commands::check_ollama_connection,
            commands::list_ollama_models,
            commands::semantic_search,
            commands::generate_solution,
            commands::suggest_tags,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
