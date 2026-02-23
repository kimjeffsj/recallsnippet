use tauri::State;

use crate::ai::ollama;
use crate::db::Database;
use crate::models::{SearchResult, Settings, SnippetSummary, Tag};

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
pub async fn semantic_search(
    db: State<'_, Database>,
    query: String,
    limit: Option<usize>,
) -> Result<Vec<SearchResult>, String> {
    let settings = get_settings_internal(&db);
    let limit = limit.unwrap_or(settings.search_limit as usize);

    // Generate query embedding
    let query_embedding = ollama::create_embedding(&query, &settings.embedding_model, &settings.ollama_base_url).await?;

    // Load all embeddings from DB and compute similarity
    let rows: Vec<(String, Vec<u8>)> = db
        .with_connection(|conn| {
            let mut stmt = conn.prepare(
                "SELECT snippet_id, embedding FROM embeddings",
            )?;
            let rows = stmt
                .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(rows)
        })
        .map_err(|e| format!("Failed to load embeddings: {}", e))?;

    // Compute cosine similarity for each
    let mut scored: Vec<(String, f64)> = rows
        .iter()
        .map(|(id, blob)| {
            let emb = decode_embedding(blob);
            let score = cosine_similarity(&query_embedding, &emb);
            (id.clone(), score)
        })
        .collect();

    // Sort by score descending
    scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    scored.truncate(limit);

    // Fetch snippet summaries
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

        let tags = fetch_tags_for_snippet(&db, &snippet_id);
        let summary = SnippetSummary { tags, ..summary };

        results.push(SearchResult {
            snippet: summary,
            score,
        });
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cosine_similarity_identical() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        let sim = cosine_similarity(&a, &b);
        assert!((sim - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_cosine_similarity_orthogonal() {
        let a = vec![1.0, 0.0];
        let b = vec![0.0, 1.0];
        let sim = cosine_similarity(&a, &b);
        assert!(sim.abs() < 1e-6);
    }

    #[test]
    fn test_cosine_similarity_opposite() {
        let a = vec![1.0, 0.0];
        let b = vec![-1.0, 0.0];
        let sim = cosine_similarity(&a, &b);
        assert!((sim - (-1.0)).abs() < 1e-6);
    }

    #[test]
    fn test_decode_embedding() {
        let original = vec![1.0_f32, 2.5, -0.3];
        let blob: Vec<u8> = original.iter().flat_map(|f| f.to_le_bytes()).collect();
        let decoded = decode_embedding(&blob);
        assert_eq!(decoded, original);
    }

    #[test]
    fn test_cosine_similarity_empty() {
        let a: Vec<f32> = vec![];
        let b: Vec<f32> = vec![];
        assert_eq!(cosine_similarity(&a, &b), 0.0);
    }

    #[test]
    fn test_cosine_similarity_zero_magnitude() {
        let a = vec![0.0, 0.0];
        let b = vec![1.0, 0.0];
        assert_eq!(cosine_similarity(&a, &b), 0.0);
    }

    #[test]
    fn test_semantic_search_db_integration() {
        // Test that we can store embeddings and retrieve/rank them
        let db = Database::new_in_memory().unwrap();

        // Insert snippets
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem) VALUES ('s1', 'Docker networking', 'Container cannot reach host')",
                [],
            )?;
            conn.execute(
                "INSERT INTO snippets (id, title, problem) VALUES ('s2', 'Pizza recipe', 'Need gluten free dough')",
                [],
            )?;
            Ok(())
        }).unwrap();

        // Store fake embeddings (3-dim for simplicity)
        let docker_emb: Vec<u8> = [0.9_f32, 0.1, 0.0].iter().flat_map(|f| f.to_le_bytes()).collect();
        let pizza_emb: Vec<u8> = [0.0_f32, 0.1, 0.9].iter().flat_map(|f| f.to_le_bytes()).collect();

        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO embeddings (snippet_id, embedding, embedding_model) VALUES ('s1', ?1, 'test')",
                rusqlite::params![docker_emb],
            )?;
            conn.execute(
                "INSERT INTO embeddings (snippet_id, embedding, embedding_model) VALUES ('s2', ?1, 'test')",
                rusqlite::params![pizza_emb],
            )?;
            Ok(())
        }).unwrap();

        // Simulate query embedding close to docker
        let query_emb = vec![0.8_f32, 0.2, 0.0];

        // Load and rank
        let rows: Vec<(String, Vec<u8>)> = db
            .with_connection(|conn| {
                let mut stmt = conn.prepare("SELECT snippet_id, embedding FROM embeddings")?;
                let rows = stmt
                    .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
                    .collect::<Result<Vec<_>, _>>()?;
                Ok(rows)
            })
            .unwrap();

        let mut scored: Vec<(String, f64)> = rows
            .iter()
            .map(|(id, blob)| {
                let emb = decode_embedding(blob);
                (id.clone(), cosine_similarity(&query_emb, &emb))
            })
            .collect();

        scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());

        // Docker should rank first
        assert_eq!(scored[0].0, "s1");
        assert!(scored[0].1 > scored[1].1);
    }
}
