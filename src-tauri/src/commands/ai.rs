use crate::ai::ollama;

#[tauri::command]
pub async fn check_ollama_connection() -> Result<bool, String> {
    ollama::check_connection().await
}

#[tauri::command]
pub async fn list_ollama_models() -> Result<Vec<String>, String> {
    ollama::list_models().await
}
