use tauri::State;
use uuid::Uuid;

use crate::ai::embedding;
use crate::db::Database;
use crate::errors::AppError;
use crate::models::{
    CreateSnippetInput, Settings, Snippet, SnippetFilter, SnippetSummary, Tag, UpdateSnippetInput,
};

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

fn fetch_tags_for_snippet(
    db: &Database,
    snippet_id: &str,
) -> Result<Vec<Tag>, AppError> {
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
    .map_err(AppError::from)
}

fn fetch_snippet_by_id(db: &Database, id: &str) -> Result<Snippet, AppError> {
    let snippet = db.with_connection(|conn| {
        conn.query_row(
            "SELECT id, title, problem, solution, code, code_language, reference_url, created_at, updated_at, is_favorite, is_deleted, deleted_at, last_accessed_at
             FROM snippets WHERE id = ?1",
            [id],
            |row| {
                Ok(Snippet {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    problem: row.get(2)?,
                    solution: row.get(3)?,
                    code: row.get(4)?,
                    code_language: row.get(5)?,
                    reference_url: row.get(6)?,
                    tags: vec![],
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                    is_favorite: row.get(9)?,
                    is_deleted: row.get(10)?,
                    deleted_at: row.get(11)?,
                    last_accessed_at: row.get(12)?,
                })
            },
        )
    }).map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => {
            AppError::NotFound(format!("Snippet with id '{id}' not found"))
        }
        other => AppError::Database(other),
    })?;

    let tags = fetch_tags_for_snippet(db, &snippet.id)?;
    Ok(Snippet { tags, ..snippet })
}

#[tauri::command]
pub async fn create_snippet(
    db: State<'_, Database>,
    input: CreateSnippetInput,
) -> Result<Snippet, String> {
    let id = Uuid::new_v4().to_string();

    db.with_connection(|conn| {
        conn.execute(
            "INSERT INTO snippets (id, title, problem, solution, code, code_language, reference_url)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![
                id,
                input.title,
                input.problem,
                input.solution,
                input.code,
                input.code_language,
                input.reference_url,
            ],
        )?;

        for tag_id in &input.tag_ids {
            conn.execute(
                "INSERT OR IGNORE INTO snippet_tags (snippet_id, tag_id) VALUES (?1, ?2)",
                rusqlite::params![id, tag_id],
            )?;
        }

        Ok(())
    })
    .map_err(|e| AppError::Database(e).to_string())?;

    let snippet = fetch_snippet_by_id(&db, &id).map_err(String::from)?;

    // Best-effort embedding: silently skip if Ollama is unavailable
    let settings = get_settings_internal(&db);
    let _ = embedding::embed_snippet(&db, &snippet, &settings.embedding_model, &settings.ollama_base_url).await;

    Ok(snippet)
}

#[tauri::command]
pub fn get_snippet(db: State<'_, Database>, id: String) -> Result<Snippet, String> {
    // Update last_accessed_at
    db.with_connection(|conn| {
        conn.execute(
            "UPDATE snippets SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?1",
            [&id],
        )?;
        Ok(())
    })
    .map_err(|e: rusqlite::Error| AppError::Database(e).to_string())?;

    fetch_snippet_by_id(&db, &id).map_err(String::from)
}

#[tauri::command]
pub fn list_snippets(
    db: State<'_, Database>,
    filter: Option<SnippetFilter>,
) -> Result<Vec<SnippetSummary>, String> {
    list_snippets_internal(&db, filter)
}

fn list_snippets_internal(
    db: &Database,
    filter: Option<SnippetFilter>,
) -> Result<Vec<SnippetSummary>, String> {
    let filter = filter.unwrap_or_default();

    let summaries = db
        .with_connection(|conn| {
            let mut sql = String::from(
                "SELECT id, title, problem, code_language, SUBSTR(code, 1, 200), created_at, is_favorite, is_deleted, deleted_at, last_accessed_at 
                 FROM snippets WHERE 1=1",
            );
            let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![];

            if let Some(ref lang) = filter.language {
                sql.push_str(" AND LOWER(code_language) = LOWER(?)");
                params.push(Box::new(lang.clone()));
            }

            if let Some(ref search) = filter.search {
                sql.push_str(" AND (title LIKE ? OR problem LIKE ?)");
                let pattern = format!("%{search}%");
                params.push(Box::new(pattern.clone()));
                params.push(Box::new(pattern));
            }

            // Filter logic
            if filter.trash_only.unwrap_or(false) {
                sql.push_str(" AND is_deleted = 1");
            } else {
                if !filter.include_deleted.unwrap_or(false) {
                    sql.push_str(" AND is_deleted = 0");
                }
                // Only apply favorites filter if not looking at trash (unless specifically combined, but usually mutually exclusive)
                if filter.favorites_only.unwrap_or(false) {
                    sql.push_str(" AND is_favorite = 1");
                }
            }

            // Sort logic
            if filter.recent_first.unwrap_or(false) {
                sql.push_str(" ORDER BY last_accessed_at DESC");
            } else {
                sql.push_str(" ORDER BY created_at DESC");
            }

            let mut stmt = conn.prepare(&sql)?;
            let param_refs: Vec<&dyn rusqlite::types::ToSql> =
                params.iter().map(|p| p.as_ref()).collect();

            let rows = stmt
                .query_map(param_refs.as_slice(), |row| {
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
                })?
                .collect::<Result<Vec<_>, _>>()?;

            Ok(rows)
        })
        .map_err(|e| AppError::Database(e).to_string())?;

    // Fetch tags for each summary
    let mut result = Vec::with_capacity(summaries.len());
    for summary in summaries {
        let tags = fetch_tags_for_snippet(db, &summary.id).map_err(String::from)?;
        result.push(SnippetSummary { tags, ..summary });
    }

    Ok(result)
}

#[tauri::command]
pub async fn update_snippet(
    db: State<'_, Database>,
    id: String,
    input: UpdateSnippetInput,
) -> Result<Snippet, String> {
    // Verify snippet exists
    fetch_snippet_by_id(&db, &id).map_err(String::from)?;

    // Check if content fields changed (triggers re-embedding)
    let needs_reembed = input.title.is_some() || input.problem.is_some() || input.solution.is_some();

    db.with_connection(|conn| {
        let mut sets = vec![];
        let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![];

        if let Some(ref title) = input.title {
            sets.push("title = ?");
            params.push(Box::new(title.clone()));
        }
        if let Some(ref problem) = input.problem {
            sets.push("problem = ?");
            params.push(Box::new(problem.clone()));
        }
        if let Some(ref solution) = input.solution {
            sets.push("solution = ?");
            params.push(Box::new(solution.clone()));
        }
        if let Some(ref code) = input.code {
            sets.push("code = ?");
            params.push(Box::new(code.clone()));
        }
        if let Some(ref code_language) = input.code_language {
            sets.push("code_language = ?");
            params.push(Box::new(code_language.clone()));
        }
        if let Some(ref reference_url) = input.reference_url {
            sets.push("reference_url = ?");
            params.push(Box::new(reference_url.clone()));
        }

        if !sets.is_empty() {
            sets.push("updated_at = CURRENT_TIMESTAMP");
            params.push(Box::new(id.clone()));

            let sql = format!(
                "UPDATE snippets SET {} WHERE id = ?",
                sets.join(", ")
            );

            let param_refs: Vec<&dyn rusqlite::types::ToSql> =
                params.iter().map(|p| p.as_ref()).collect();
            conn.execute(&sql, param_refs.as_slice())?;
        }

        // Update tags if provided
        if let Some(ref tag_ids) = input.tag_ids {
            conn.execute(
                "DELETE FROM snippet_tags WHERE snippet_id = ?1",
                [&id],
            )?;
            for tag_id in tag_ids {
                conn.execute(
                    "INSERT OR IGNORE INTO snippet_tags (snippet_id, tag_id) VALUES (?1, ?2)",
                    rusqlite::params![id, tag_id],
                )?;
            }
        }

        Ok(())
    })
    .map_err(|e| AppError::Database(e).to_string())?;

    let snippet = fetch_snippet_by_id(&db, &id).map_err(String::from)?;

    // Re-embed if content fields changed
    if needs_reembed {
        let settings = get_settings_internal(&db);
        let _ = embedding::embed_snippet(&db, &snippet, &settings.embedding_model, &settings.ollama_base_url).await;
    }

    Ok(snippet)
}

#[tauri::command]
pub fn delete_snippet(db: State<'_, Database>, id: String) -> Result<(), String> {
    // Verify snippet exists
    fetch_snippet_by_id(&db, &id).map_err(String::from)?;

    // Soft delete
    db.with_connection(|conn| {
        conn.execute(
            "UPDATE snippets SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?1",
            [&id],
        )?;
        Ok(())
    })
    .map_err(|e| AppError::Database(e).to_string())
}

#[tauri::command]
pub fn toggle_favorite(db: State<'_, Database>, id: String) -> Result<Snippet, String> {
    fetch_snippet_by_id(&db, &id).map_err(String::from)?;

    db.with_connection(|conn| {
        conn.execute(
            "UPDATE snippets SET is_favorite = NOT is_favorite WHERE id = ?1",
            [&id],
        )?;
        Ok(())
    })
    .map_err(|e| AppError::Database(e).to_string())?;

    fetch_snippet_by_id(&db, &id).map_err(String::from)
}

#[tauri::command]
pub fn restore_snippet(db: State<'_, Database>, id: String) -> Result<Snippet, String> {
    fetch_snippet_by_id(&db, &id).map_err(String::from)?;

    db.with_connection(|conn| {
        conn.execute(
            "UPDATE snippets SET is_deleted = 0, deleted_at = NULL WHERE id = ?1",
            [&id],
        )?;
        Ok(())
    })
    .map_err(|e| AppError::Database(e).to_string())?;

    fetch_snippet_by_id(&db, &id).map_err(String::from)
}

#[tauri::command]
pub fn permanent_delete_snippet(db: State<'_, Database>, id: String) -> Result<(), String> {
    fetch_snippet_by_id(&db, &id).map_err(String::from)?;

    db.with_connection(|conn| {
        conn.execute("DELETE FROM snippets WHERE id = ?1", [&id])?;
        Ok(())
    })
    .map_err(|e| AppError::Database(e).to_string())
}

#[cfg(test)]
mod tests {
    use crate::db::Database;
    use crate::errors::AppError;
    use crate::models::*;

    // Helper: create a test database with a sample tag
    fn setup_db() -> Database {
        let db = Database::new_in_memory().unwrap();
        // Run all migrations to include metadata columns
        
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO tags (id, name) VALUES ('tag-rust', 'rust')",
                [],
            )?;
            conn.execute(
                "INSERT INTO tags (id, name) VALUES ('tag-python', 'python')",
                [],
            )?;
            Ok(())
        })
        .unwrap();
        db
    }

    // Helper: create a snippet directly and return its id
    fn create_test_snippet(db: &Database, title: &str, tag_ids: &[&str]) -> String {
        let id = uuid::Uuid::new_v4().to_string();
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem, code_language) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![id, title, "test problem", "rust"],
            )?;
            for tag_id in tag_ids {
                conn.execute(
                    "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?1, ?2)",
                    rusqlite::params![id, tag_id],
                )?;
            }
            Ok(())
        })
        .unwrap();
        id
    }

    // Helper to reuse fetch logic without tauri::State
    fn fetch_snippet(db: &Database, id: &str) -> Result<Snippet, AppError> {
        super::fetch_snippet_by_id(db, id)
    }

    fn fetch_tags(db: &Database, snippet_id: &str) -> Vec<Tag> {
        super::fetch_tags_for_snippet(db, snippet_id).unwrap()
    }

    // ===== create_snippet tests =====

    #[test]
    fn test_create_snippet_basic() {
        // Given
        let db = setup_db();

        // When
        let id = uuid::Uuid::new_v4().to_string();
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem, solution, code, code_language)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                rusqlite::params![id, "Test Title", "Test Problem", "Test Solution", "fn main() {}", "rust"],
            )?;
            conn.execute(
                "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?1, ?2)",
                rusqlite::params![id, "tag-rust"],
            )?;
            Ok(())
        })
        .unwrap();

        // Then
        let snippet = fetch_snippet(&db, &id).unwrap();
        assert_eq!(snippet.title, "Test Title");
        assert_eq!(snippet.problem, "Test Problem");
        assert_eq!(snippet.solution, Some("Test Solution".to_string()));
        assert_eq!(snippet.code, Some("fn main() {}".to_string()));
        assert_eq!(snippet.code_language, Some("rust".to_string()));
        assert_eq!(snippet.tags.len(), 1);
        assert_eq!(snippet.tags[0].name, "rust");
        // Verify defaults
        assert_eq!(snippet.is_favorite, false);
        assert_eq!(snippet.is_deleted, false);
    }

    #[test]
    fn test_create_snippet_minimal_fields() {
        // Given
        let db = setup_db();

        // When - only required fields
        let id = uuid::Uuid::new_v4().to_string();
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem) VALUES (?1, ?2, ?3)",
                rusqlite::params![id, "Minimal", "Just a problem"],
            )?;
            Ok(())
        })
        .unwrap();

        // Then
        let snippet = fetch_snippet(&db, &id).unwrap();
        assert_eq!(snippet.title, "Minimal");
        assert!(snippet.solution.is_none());
        assert!(snippet.code.is_none());
        assert!(snippet.tags.is_empty());
    }

    #[test]
    fn test_create_snippet_with_multiple_tags() {
        // Given
        let db = setup_db();

        // When
        let id = create_test_snippet(&db, "Multi Tag", &["tag-rust", "tag-python"]);

        // Then
        let tags = fetch_tags(&db, &id);
        assert_eq!(tags.len(), 2);
        let tag_names: Vec<&str> = tags.iter().map(|t| t.name.as_str()).collect();
        assert!(tag_names.contains(&"rust"));
        assert!(tag_names.contains(&"python"));
    }

    // ===== get_snippet tests =====

    #[test]
    fn test_get_snippet_found() {
        // Given
        let db = setup_db();
        let id = create_test_snippet(&db, "Find Me", &["tag-rust"]);

        // When
        let snippet = fetch_snippet(&db, &id).unwrap();

        // Then
        assert_eq!(snippet.title, "Find Me");
        assert_eq!(snippet.tags.len(), 1);
    }

    #[test]
    fn test_get_snippet_not_found() {
        // Given
        let db = setup_db();

        // When
        let result = fetch_snippet(&db, "nonexistent-id");

        // Then
        assert!(result.is_err());
        let err = result.unwrap_err();
        match err {
            AppError::NotFound(msg) => {
                assert!(msg.contains("nonexistent-id"));
            }
            _ => panic!("Expected NotFound error"),
        }
    }

    // ===== list_snippets tests =====

    #[test]
    fn test_list_snippets_empty() {
        // Given
        let db = setup_db();

        // When
        let result = db
            .with_connection(|conn| {
                let mut stmt = conn.prepare(
                    "SELECT id, title, problem, code_language, created_at, is_favorite, is_deleted, deleted_at, last_accessed_at FROM snippets ORDER BY created_at DESC",
                )?;
                let rows = stmt
                    .query_map([], |row| {
                        Ok(SnippetSummary {
                            id: row.get(0)?,
                            title: row.get(1)?,
                            problem: row.get(2)?,
                            code_language: row.get(3)?,
                            code_preview: None,
                            tags: vec![],
                            created_at: row.get(4)?,
                            is_favorite: row.get(5)?,
                            is_deleted: row.get(6)?,
                            deleted_at: row.get(7)?,
                            last_accessed_at: row.get(8)?,
                        })
                    })?
                    .collect::<Result<Vec<_>, _>>()?;
                Ok(rows)
            })
            .unwrap();

        // Then
        assert!(result.is_empty());
    }

    #[test]
    fn test_list_snippets_returns_all() {
        // Given
        let db = setup_db();
        create_test_snippet(&db, "First", &[]);
        create_test_snippet(&db, "Second", &[]);

        // When
        let result = db
            .with_connection(|conn| {
                let mut stmt = conn.prepare(
                    "SELECT id, title, problem, code_language, created_at, is_favorite, is_deleted, deleted_at, last_accessed_at FROM snippets ORDER BY created_at DESC",
                )?;
                let rows = stmt
                    .query_map([], |row| {
                        Ok(SnippetSummary {
                            id: row.get(0)?,
                            title: row.get(1)?,
                            problem: row.get(2)?,
                            code_language: row.get(3)?,
                            code_preview: None,
                            tags: vec![],
                            created_at: row.get(4)?,
                            is_favorite: row.get(5)?,
                            is_deleted: row.get(6)?,
                            deleted_at: row.get(7)?,
                            last_accessed_at: row.get(8)?,
                        })
                    })?
                    .collect::<Result<Vec<_>, _>>()?;
                Ok(rows)
            })
            .unwrap();

        // Then
        assert_eq!(result.len(), 2);
    }

    #[test]
    fn test_list_snippets_filter_by_language() {
        // Given
        let db = setup_db();
        create_test_snippet(&db, "Rust Snippet", &[]);
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem, code_language) VALUES ('py1', 'Python Snippet', 'problem', 'python')",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        // When - filter by rust
        let result = db
            .with_connection(|conn| {
                let mut stmt = conn.prepare(
                    "SELECT id, title, problem, code_language, created_at, is_favorite, is_deleted, deleted_at, last_accessed_at FROM snippets WHERE code_language = ?1 ORDER BY created_at DESC",
                )?;
                let rows = stmt
                    .query_map(["rust"], |row| {
                        Ok(SnippetSummary {
                            id: row.get(0)?,
                            title: row.get(1)?,
                            problem: row.get(2)?,
                            code_language: row.get(3)?,
                            code_preview: None,
                            tags: vec![],
                            created_at: row.get(4)?,
                            is_favorite: row.get(5)?,
                            is_deleted: row.get(6)?,
                            deleted_at: row.get(7)?,
                            last_accessed_at: row.get(8)?,
                        })
                    })?
                    .collect::<Result<Vec<_>, _>>()?;
                Ok(rows)
            })
            .unwrap();

        // Then
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].title, "Rust Snippet");
    }

    // ===== update_snippet tests =====

    #[test]
    fn test_update_snippet_title() {
        // Given
        let db = setup_db();
        let id = create_test_snippet(&db, "Old Title", &[]);

        // When
        db.with_connection(|conn| {
            conn.execute(
                "UPDATE snippets SET title = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
                rusqlite::params!["New Title", id],
            )?;
            Ok(())
        })
        .unwrap();

        // Then
        let snippet = fetch_snippet(&db, &id).unwrap();
        assert_eq!(snippet.title, "New Title");
    }

    // ===== delete_snippet tests =====

    #[test]
    fn test_delete_snippet_soft_delete() {
        // Given
        let db = setup_db();
        let id = create_test_snippet(&db, "Delete Me", &["tag-rust"]);

        // When - Soft delete manually in test helper simulation
        // (In real flow, we'd call delete_snippet)
        db.with_connection(|conn| {
            conn.execute(
                "UPDATE snippets SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?1",
                [&id],
            )?;
            Ok(())
        })
        .unwrap();

        // Then - snippet should still exist but marked as deleted
        let snippet = fetch_snippet(&db, &id).unwrap();
        assert_eq!(snippet.is_deleted, true);
        assert!(snippet.deleted_at.is_some());
    }

    // ===== new feature tests =====

    #[test]
    fn test_toggle_favorite() {
        // Given
        let db = setup_db();
        let id = create_test_snippet(&db, "Fav Me", &[]);

        // When
        db.with_connection(|conn| {
            conn.execute(
                "UPDATE snippets SET is_favorite = NOT is_favorite WHERE id = ?1",
                [&id],
            )?;
            Ok(())
        }).unwrap();

        // Then
        let snippet = fetch_snippet(&db, &id).unwrap();
        assert_eq!(snippet.is_favorite, true);
        
        // Toggle back
        db.with_connection(|conn| {
            conn.execute(
                "UPDATE snippets SET is_favorite = NOT is_favorite WHERE id = ?1",
                [&id],
            )?;
            Ok(())
        }).unwrap();
        let snippet = fetch_snippet(&db, &id).unwrap();
        assert_eq!(snippet.is_favorite, false);
    }

    #[test]
    fn test_restore_snippet() {
        // Given - deleted snippet
        let db = setup_db();
        let id = create_test_snippet(&db, "Restore Me", &[]);
        db.with_connection(|conn| {
            conn.execute("UPDATE snippets SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?1", [&id])?;
            Ok(())
        }).unwrap();

        // When - restore
        db.with_connection(|conn| {
            conn.execute("UPDATE snippets SET is_deleted = 0, deleted_at = NULL WHERE id = ?1", [&id])?;
            Ok(())
        }).unwrap();

        // Then
        let snippet = fetch_snippet(&db, &id).unwrap();
        assert_eq!(snippet.is_deleted, false);
        assert!(snippet.deleted_at.is_none());
    }

    #[test]
    fn test_list_snippets_filter_favorites() {
        // Given
        let db = setup_db();
        let id1 = create_test_snippet(&db, "Fav", &[]);
        let id2 = create_test_snippet(&db, "Normal", &[]);

        // Mark id1 as favorite
        db.with_connection(|conn| {
            conn.execute("UPDATE snippets SET is_favorite = 1 WHERE id = ?1", [&id1])?;
            Ok(())
        }).unwrap();

        // When
        let result = super::list_snippets_internal(
            &db,
            Some(SnippetFilter {
                favorites_only: Some(true),
                ..Default::default()
            }),
        ).unwrap();

        // Then
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].title, "Fav");
    }

    #[test]
    fn test_list_snippets_filter_trash() {
        // Given
        let db = setup_db();
        let id1 = create_test_snippet(&db, "Deleted", &[]);
        let id2 = create_test_snippet(&db, "Active", &[]);

        // Soft delete id1
        db.with_connection(|conn| {
            conn.execute("UPDATE snippets SET is_deleted = 1 WHERE id = ?1", [&id1])?;
            Ok(())
        }).unwrap();

        // When - list active (default)
        let result_active = super::list_snippets_internal(
            &db,
            None,
        ).unwrap();
        assert_eq!(result_active.len(), 1);
        assert_eq!(result_active[0].title, "Active");

        // When - list trash
        let result_trash = super::list_snippets_internal(
            &db,
            Some(SnippetFilter {
                trash_only: Some(true),
                ..Default::default()
            }),
        ).unwrap();
        assert_eq!(result_trash.len(), 1);
        assert_eq!(result_trash[0].title, "Deleted");
    }

    #[test]
    fn test_list_snippets_recent_first() {
        // Given
        let db = setup_db();
        let id1 = create_test_snippet(&db, "Old Access", &[]);
        let id2 = create_test_snippet(&db, "New Access", &[]);

        // Set last_accessed_at manually
        db.with_connection(|conn| {
            conn.execute("UPDATE snippets SET last_accessed_at = '2020-01-01 00:00:00' WHERE id = ?1", [&id1])?;
            conn.execute("UPDATE snippets SET last_accessed_at = '2025-01-01 00:00:00' WHERE id = ?1", [&id2])?;
            Ok(())
        }).unwrap();

        // When
        let result = super::list_snippets_internal(
            &db,
            Some(SnippetFilter {
                recent_first: Some(true),
                ..Default::default()
            }),
        ).unwrap();

        // Then
        assert_eq!(result.len(), 2);
        assert_eq!(result[0].title, "New Access");
        assert_eq!(result[1].title, "Old Access");
    }
}
