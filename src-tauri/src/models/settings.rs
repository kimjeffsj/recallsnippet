use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub theme: String,
    pub ollama_base_url: String,
    pub llm_model: String,
    pub embedding_model: String,
    pub search_limit: i32,
    pub data_path: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            ollama_base_url: "http://localhost:11434".to_string(),
            llm_model: "qwen2.5-coder:7b".to_string(),
            embedding_model: "nomic-embed-text".to_string(),
            search_limit: 10,
            data_path: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsInput {
    pub theme: Option<String>,
    pub ollama_base_url: Option<String>,
    pub llm_model: Option<String>,
    pub embedding_model: Option<String>,
    pub search_limit: Option<i32>,
    pub data_path: Option<String>,
}
