use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SnippetSource {
    pub id: String,
    pub title: String,
    pub score: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AiChatResponse {
    pub answer: String,
    pub sources: Vec<SnippetSource>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Snippet {
    pub id: String,
    pub title: String,
    pub problem: String,
    pub solution: Option<String>,
    pub code: Option<String>,
    pub code_language: Option<String>,
    pub reference_url: Option<String>,
    pub tags: Vec<Tag>,
    pub created_at: String,
    pub updated_at: String,
    pub is_favorite: bool,
    pub is_deleted: bool,
    pub deleted_at: Option<String>,
    pub last_accessed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnippetSummary {
    pub id: String,
    pub title: String,
    pub problem: String,
    pub code_language: Option<String>,
    pub code_preview: Option<String>,
    pub tags: Vec<Tag>,
    pub created_at: String,
    pub is_favorite: bool,
    pub is_deleted: bool,
    pub deleted_at: Option<String>,
    pub last_accessed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSnippetInput {
    pub title: String,
    pub problem: String,
    pub solution: Option<String>,
    pub code: Option<String>,
    pub code_language: Option<String>,
    pub reference_url: Option<String>,
    pub tag_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSnippetInput {
    pub title: Option<String>,
    pub problem: Option<String>,
    pub solution: Option<String>,
    pub code: Option<String>,
    pub code_language: Option<String>,
    pub reference_url: Option<String>,
    pub tag_ids: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnippetFilter {
    pub language: Option<String>,
    pub search: Option<String>,
    pub favorites_only: Option<bool>,
    pub trash_only: Option<bool>,
    pub include_deleted: Option<bool>,
    pub recent_first: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub snippet: SnippetSummary,
    pub score: f64,
}
