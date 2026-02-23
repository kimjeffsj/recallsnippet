use serde::Deserialize;
use tauri::State;

use crate::ai::ollama;
use crate::db::Database;
use crate::models::{AiChatResponse, Settings, SnippetSource, SnippetSummary, Tag};

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

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnippetContext {
    pub title: String,
    pub problem: String,
    pub solution: Option<String>,
    pub code: Option<String>,
}

fn fetch_tags_for_snippet(db: &Database, snippet_id: &str) -> Vec<Tag> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name FROM tags t
             INNER JOIN snippet_tags st ON st.tag_id = t.id
             WHERE st.snippet_id = ?1",
        )?;
        let tags = stmt
            .query_map([snippet_id], |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(tags)
    })
    .unwrap_or_default()
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f64 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }
    let dot: f64 = a.iter().zip(b.iter()).map(|(x, y)| (*x as f64) * (*y as f64)).sum();
    let mag_a: f64 = a.iter().map(|x| (*x as f64) * (*x as f64)).sum::<f64>().sqrt();
    let mag_b: f64 = b.iter().map(|x| (*x as f64) * (*x as f64)).sum::<f64>().sqrt();
    if mag_a == 0.0 || mag_b == 0.0 {
        return 0.0;
    }
    dot / (mag_a * mag_b)
}

fn decode_embedding(blob: &[u8]) -> Vec<f32> {
    blob.chunks_exact(4)
        .map(|chunk| f32::from_le_bytes(chunk.try_into().unwrap()))
        .collect()
}

fn search_similar_snippets(db: &Database, query_embedding: &[f32], limit: usize) -> Result<Vec<(SnippetSummary, f64)>, String> {
    let rows: Vec<(String, Vec<u8>)> = db
        .with_connection(|conn| {
            let mut stmt = conn.prepare("SELECT snippet_id, embedding FROM embeddings")?;
            let rows = stmt
                .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(rows)
        })
        .map_err(|e| format!("Failed to load embeddings: {}", e))?;

    let mut scored: Vec<(String, f64)> = rows
        .iter()
        .map(|(id, blob)| {
            let emb = decode_embedding(blob);
            let score = cosine_similarity(query_embedding, &emb);
            (id.clone(), score)
        })
        .collect();

    scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    scored.truncate(limit);

    let mut results = Vec::with_capacity(scored.len());
    for (snippet_id, score) in scored {
        let summary = db
            .with_connection(|conn| {
                conn.query_row(
                    "SELECT id, title, problem, code_language, SUBSTR(code, 1, 200), created_at, is_favorite, is_deleted, deleted_at, last_accessed_at
                     FROM snippets WHERE id = ?1",
                    [&snippet_id],
                    |row| {
                        Ok(SnippetSummary {
                            id: row.get(0)?,
                            title: row.get(1)?,
                            problem: row.get(2)?,
                            code_language: row.get(3)?,
                            code_preview: row.get(4)?,
                            tags: vec![],
                            created_at: row.get(5)?,
                            is_favorite: row.get(6)?,
                            is_deleted: row.get(7)?,
                            deleted_at: row.get(8)?,
                            last_accessed_at: row.get(9)?,
                        })
                    },
                )
            })
            .map_err(|e| format!("Failed to fetch snippet: {}", e))?;

        let tags = fetch_tags_for_snippet(db, &snippet_id);
        let summary = SnippetSummary { tags, ..summary };
        results.push((summary, score));
    }

    Ok(results)
}

#[tauri::command]
pub async fn ai_chat(
    db: State<'_, Database>,
    message: String,
    snippet_context: Option<SnippetContext>,
) -> Result<AiChatResponse, String> {
    let settings = get_settings_internal(&db);

    // Semantic search for relevant snippets
    let query_embedding = ollama::create_embedding(&message, &settings.embedding_model, &settings.ollama_base_url).await?;
    let similar = search_similar_snippets(&db, &query_embedding, 5)?;

    // Collect sources with score >= 0.3
    let sources: Vec<SnippetSource> = similar
        .iter()
        .filter(|(_, score)| *score >= 0.3)
        .map(|(s, score)| SnippetSource {
            id: s.id.clone(),
            title: s.title.clone(),
            score: *score,
        })
        .collect();

    // Build context from search results
    let mut context_parts = Vec::new();
    for (snippet, score) in &similar {
        if *score < 0.3 {
            continue;
        }
        context_parts.push(format!(
            "### {} (Relevance: {:.0}%)\n**Problem:** {}\n{}",
            snippet.title,
            score * 100.0,
            snippet.problem,
            snippet.code_preview.as_deref().map(|c| format!("**Code preview:** ```\n{}\n```", c)).unwrap_or_default(),
        ));
    }

    let snippets_context = if context_parts.is_empty() {
        "No relevant snippets found in the knowledge base.".to_string()
    } else {
        context_parts.join("\n\n")
    };

    // Build snippet-specific context if provided
    let snippet_section = match snippet_context {
        Some(ctx) => format!(
            "\n\nThe user is currently viewing this snippet:\n**Title:** {}\n**Problem:** {}\n{}{}\n",
            ctx.title,
            ctx.problem,
            ctx.solution.map(|s| format!("**Solution:** {}\n", s)).unwrap_or_default(),
            ctx.code.map(|c| format!("**Code:**\n```\n{}\n```\n", c)).unwrap_or_default(),
        ),
        None => String::new(),
    };

    let prompt = format!(
        r#"You are a recall assistant for a developer's code snippet knowledge base.
The user has previously recorded solutions to programming problems.
Your job is to help them find and recall relevant information from their notes.

Based on the following relevant snippets from their knowledge base, answer the user's question.
If no relevant snippets are found, let the user know.
Always reference which snippet(s) you're drawing from.

## Relevant snippets from knowledge base:
{snippets_context}
{snippet_section}
## User question:
{message}

## Your answer:"#
    );

    let answer = ollama::generate(&prompt, &settings.llm_model, &settings.ollama_base_url).await?;
    Ok(AiChatResponse { answer, sources })
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
