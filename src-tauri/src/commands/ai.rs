use crate::ai::ollama;

const DEFAULT_LLM_MODEL: &str = "qwen2.5-coder:7b";

#[tauri::command]
pub async fn check_ollama_connection() -> Result<bool, String> {
    ollama::check_connection().await
}

#[tauri::command]
pub async fn list_ollama_models() -> Result<Vec<String>, String> {
    ollama::list_models().await
}

#[tauri::command]
pub async fn generate_solution(
    problem: String,
    model: Option<String>,
) -> Result<String, String> {
    let model = model.as_deref().unwrap_or(DEFAULT_LLM_MODEL);

    let prompt = format!(
        r#"You are an AI assistant helping developers solve programming problems.
Given the following development problem, provide a clear and practical solution in markdown format.
Be concise and focus on actionable steps.

Problem:
{problem}

Solution:"#
    );

    ollama::generate(&prompt, model).await
}

#[tauri::command]
pub async fn suggest_tags(
    content: String,
    model: Option<String>,
) -> Result<Vec<String>, String> {
    let model = model.as_deref().unwrap_or(DEFAULT_LLM_MODEL);

    let prompt = format!(
        r#"Analyze the following development-related content and suggest 3-5 relevant tags.
Tags should include technology stacks, categories, and key concepts.
Respond ONLY with a JSON array of strings. No explanation.

Content:
{content}

Tags (JSON array only):"#
    );

    let response = ollama::generate(&prompt, model).await?;

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
