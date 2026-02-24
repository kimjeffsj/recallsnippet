use crate::db::Database;
use crate::models::Snippet;

/// Prepare text for embedding by combining snippet fields.
/// Title is repeated for higher weight.
pub fn prepare_text(snippet: &Snippet) -> String {
    format!(
        "{title} {title} {problem} {solution}",
        title = snippet.title,
        problem = snippet.problem,
        solution = snippet.solution.as_deref().unwrap_or("")
    )
    .trim()
    .to_string()
}

/// Save an embedding vector to the database
pub fn save_embedding(
    db: &Database,
    snippet_id: &str,
    embedding: &[f32],
    model: &str,
) -> Result<(), String> {
    let embedding_bytes: Vec<u8> = embedding.iter().flat_map(|f| f.to_le_bytes()).collect();

    db.with_connection(|conn| {
        conn.execute(
            "INSERT OR REPLACE INTO embeddings (snippet_id, embedding, embedding_model, created_at)
             VALUES (?1, ?2, ?3, datetime('now'))",
            rusqlite::params![snippet_id, embedding_bytes, model],
        )?;
        Ok(())
    })
    .map_err(|e| format!("Failed to save embedding: {}", e))
}

/// Generate and save embedding for a snippet (best-effort: silently skips if Ollama unavailable)
pub async fn embed_snippet(
    db: &Database,
    snippet: &Snippet,
    embedding_model: &str,
    base_url: &str,
) -> Result<(), String> {
    let text = prepare_text(snippet);
    let embedding = super::ollama::create_embedding(&text, embedding_model, base_url).await?;
    save_embedding(db, &snippet.id, &embedding, embedding_model)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::Snippet;

    fn make_snippet(title: &str, problem: &str, solution: Option<&str>) -> Snippet {
        Snippet {
            id: "test-id".to_string(),
            title: title.to_string(),
            problem: problem.to_string(),
            solution: solution.map(String::from),
            code: None,
            code_language: None,
            reference_url: None,
            tags: vec![],
            created_at: "2026-02-09".to_string(),
            updated_at: "2026-02-09".to_string(),
            is_favorite: false,
            is_deleted: false,
            deleted_at: None,
            last_accessed_at: None,
        }
    }

    #[test]
    fn test_prepare_text_with_solution() {
        let snippet = make_snippet(
            "Docker error",
            "Container won't start",
            Some("Restart daemon"),
        );
        let text = prepare_text(&snippet);

        assert!(text.contains("Docker error"));
        assert!(text.contains("Container won't start"));
        assert!(text.contains("Restart daemon"));
        // Title should appear twice for weighting
        assert_eq!(text.matches("Docker error").count(), 2);
    }

    #[test]
    fn test_prepare_text_without_solution() {
        let snippet = make_snippet("Rust borrow", "Cannot borrow mutably", None);
        let text = prepare_text(&snippet);

        assert!(text.contains("Rust borrow"));
        assert!(text.contains("Cannot borrow mutably"));
        assert_eq!(text.matches("Rust borrow").count(), 2);
    }

    #[test]
    fn test_save_and_read_embedding() {
        let db = Database::new_in_memory().unwrap();

        // Insert a snippet first
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem) VALUES ('s1', 'Test', 'Problem')",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        // Save embedding
        let embedding = vec![0.1_f32, 0.2, 0.3, 0.4];
        save_embedding(&db, "s1", &embedding, "test-model").unwrap();

        // Verify it was saved
        let (stored_model, stored_blob): (String, Vec<u8>) = db
            .with_connection(|conn| {
                conn.query_row(
                    "SELECT embedding_model, embedding FROM embeddings WHERE snippet_id = 's1'",
                    [],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
            })
            .unwrap();

        assert_eq!(stored_model, "test-model");

        // Decode stored blob back to f32 vector
        let decoded: Vec<f32> = stored_blob
            .chunks_exact(4)
            .map(|chunk| f32::from_le_bytes(chunk.try_into().unwrap()))
            .collect();

        assert_eq!(decoded, embedding);
    }

    #[test]
    fn test_save_embedding_replaces_existing() {
        let db = Database::new_in_memory().unwrap();

        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem) VALUES ('s1', 'Test', 'Problem')",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        // Save first embedding
        save_embedding(&db, "s1", &[1.0, 2.0], "model-v1").unwrap();

        // Replace with new embedding
        save_embedding(&db, "s1", &[3.0, 4.0], "model-v2").unwrap();

        // Should have only one row
        let count: i32 = db
            .with_connection(|conn| {
                conn.query_row(
                    "SELECT COUNT(*) FROM embeddings WHERE snippet_id = 's1'",
                    [],
                    |row| row.get(0),
                )
            })
            .unwrap();
        assert_eq!(count, 1);

        // Should be the new one
        let model: String = db
            .with_connection(|conn| {
                conn.query_row(
                    "SELECT embedding_model FROM embeddings WHERE snippet_id = 's1'",
                    [],
                    |row| row.get(0),
                )
            })
            .unwrap();
        assert_eq!(model, "model-v2");
    }
}
