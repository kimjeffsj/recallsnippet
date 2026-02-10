use tauri::State;

use crate::ai::ollama;
use crate::db::Database;
use crate::models::Settings;

fn get_settings_internal(db: &Database) -> Settings {
    db.with_connection(|conn| {
        conn.query_row(
            "SELECT theme, ollama_base_url, llm_model, embedding_model, search_limit, data_path
             FROM settings WHERE id = 1",
            [],
            |row| {
                Ok(Settings {
                    theme: row.get(0)?,
                    ollama_base_url: row.get(1)?,
                    llm_model: row.get(2)?,
                    embedding_model: row.get(3)?,
                    search_limit: row.get(4)?,
                    data_path: row.get(5)?,
                })
            },
        )
    })
    .unwrap_or_default()
}

#[tauri::command]
pub async fn check_ollama_connection(db: State<'_, Database>) -> Result<bool, String> {
    let settings = get_settings_internal(&db);
    ollama::check_connection(&settings.ollama_base_url).await
}

#[tauri::command]
pub async fn list_ollama_models(db: State<'_, Database>) -> Result<Vec<String>, String> {
    let settings = get_settings_internal(&db);
    ollama::list_models(&settings.ollama_base_url).await
}

#[tauri::command]
pub async fn generate_solution(
    db: State<'_, Database>,
    problem: String,
    model: Option<String>,
) -> Result<String, String> {
    let settings = get_settings_internal(&db);
    let model = model.as_deref().unwrap_or(&settings.llm_model);

    let prompt = format!(
        r#"You are an AI assistant helping developers solve programming problems.
Given the following development problem, provide a clear and practical solution in markdown format.
Be concise and focus on actionable steps.

Problem:
{problem}

Solution:"#
    );

    ollama::generate(&prompt, model, &settings.ollama_base_url).await
}

#[tauri::command]
pub async fn suggest_tags(
    db: State<'_, Database>,
    content: String,
    model: Option<String>,
) -> Result<Vec<String>, String> {
    let settings = get_settings_internal(&db);
    let model = model.as_deref().unwrap_or(&settings.llm_model);

    let prompt = format!(
        r#"Analyze the following development-related content and suggest 3-5 relevant tags.
Tags should include technology stacks, categories, and key concepts.
Respond ONLY with a JSON array of strings. No explanation.

Content:
{content}

Tags (JSON array only):"#
    );

    let response = ollama::generate(&prompt, model, &settings.ollama_base_url).await?;

    // Try to parse JSON array from response
    parse_tags_from_response(&response)
}

fn parse_tags_from_response(response: &str) -> Result<Vec<String>, String> {
    // Try direct JSON parse first
    if let Ok(tags) = serde_json::from_str::<Vec<String>>(response.trim()) {
        return Ok(tags);
    }

    // Try to extract JSON array from response text
    if let Some(start) = response.find('[') {
        if let Some(end) = response[start..].find(']') {
            let json_str = &response[start..=start + end];
            if let Ok(tags) = serde_json::from_str::<Vec<String>>(json_str) {
                return Ok(tags);
            }
        }
    }

    // Fallback: empty tags
    Ok(vec![])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_tags_direct_json() {
        let input = r#"["rust", "async", "tokio"]"#;
        let tags = parse_tags_from_response(input).unwrap();
        assert_eq!(tags, vec!["rust", "async", "tokio"]);
    }

    #[test]
    fn test_parse_tags_with_surrounding_text() {
        let input = r#"Here are the tags: ["docker", "networking", "linux"] Hope this helps!"#;
        let tags = parse_tags_from_response(input).unwrap();
        assert_eq!(tags, vec!["docker", "networking", "linux"]);
    }

    #[test]
    fn test_parse_tags_with_newlines() {
        let input = "[\n  \"react\",\n  \"typescript\",\n  \"frontend\"\n]";
        let tags = parse_tags_from_response(input).unwrap();
        assert_eq!(tags, vec!["react", "typescript", "frontend"]);
    }

    #[test]
    fn test_parse_tags_invalid_returns_empty() {
        let input = "I couldn't understand the request";
        let tags = parse_tags_from_response(input).unwrap();
        assert!(tags.is_empty());
    }

    #[test]
    fn test_parse_tags_empty_array() {
        let input = "[]";
        let tags = parse_tags_from_response(input).unwrap();
        assert!(tags.is_empty());
    }
}
