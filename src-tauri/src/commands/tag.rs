use tauri::State;
use uuid::Uuid;

use crate::db::Database;
use crate::errors::AppError;
use crate::models::Tag;

fn fetch_all_tags(db: &Database) -> Result<Vec<Tag>, AppError> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare("SELECT id, name FROM tags ORDER BY name ASC")?;
        let tags = stmt
            .query_map([], |row| {
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

fn insert_tag(db: &Database, name: &str) -> Result<Tag, AppError> {
    // Check if tag with same name already exists
    let existing = db.with_connection(|conn| {
        conn.query_row(
            "SELECT id, name FROM tags WHERE name = ?1",
            [name],
            |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                })
            },
        )
    });

    if let Ok(tag) = existing {
        return Ok(tag);
    }

    let id = Uuid::new_v4().to_string();
    db.with_connection(|conn| {
        conn.execute(
            "INSERT INTO tags (id, name) VALUES (?1, ?2)",
            rusqlite::params![id, name],
        )?;
        Ok(())
    })
    .map_err(AppError::from)?;

    Ok(Tag {
        id,
        name: name.to_string(),
    })
}

#[tauri::command]
pub fn list_tags(db: State<'_, Database>) -> Result<Vec<Tag>, String> {
    fetch_all_tags(&db).map_err(String::from)
}

#[tauri::command]
pub fn create_tag(db: State<'_, Database>, name: String) -> Result<Tag, String> {
    let trimmed = name.trim().to_string();
    if trimmed.is_empty() {
        return Err("Tag name cannot be empty".to_string());
    }
    insert_tag(&db, &trimmed).map_err(String::from)
}

#[tauri::command]
pub fn delete_tag(db: State<'_, Database>, id: String) -> Result<(), String> {
    // Verify tag exists
    let exists = db
        .with_connection(|conn| {
            conn.query_row(
                "SELECT EXISTS(SELECT 1 FROM tags WHERE id = ?1)",
                [&id],
                |row| row.get::<_, bool>(0),
            )
        })
        .map_err(|e| AppError::Database(e).to_string())?;

    if !exists {
        return Err(AppError::NotFound(format!("Tag with id '{id}' not found")).to_string());
    }

    db.with_connection(|conn| {
        conn.execute("DELETE FROM tags WHERE id = ?1", [&id])?;
        Ok(())
    })
    .map_err(|e| AppError::Database(e).to_string())
}

#[cfg(test)]
mod tests {
    use crate::db::Database;
    use crate::models::Tag;

    fn setup_db() -> Database {
        Database::new_in_memory().unwrap()
    }

    fn insert_tag_direct(db: &Database, id: &str, name: &str) {
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO tags (id, name) VALUES (?1, ?2)",
                rusqlite::params![id, name],
            )?;
            Ok(())
        })
        .unwrap();
    }

    fn get_all_tags(db: &Database) -> Vec<Tag> {
        super::fetch_all_tags(db).unwrap()
    }

    // ===== list_tags tests =====

    #[test]
    fn test_list_tags_empty() {
        // Given
        let db = setup_db();

        // When
        let tags = get_all_tags(&db);

        // Then
        assert!(tags.is_empty());
    }

    #[test]
    fn test_list_tags_returns_all_sorted() {
        // Given
        let db = setup_db();
        insert_tag_direct(&db, "t1", "python");
        insert_tag_direct(&db, "t2", "rust");
        insert_tag_direct(&db, "t3", "javascript");

        // When
        let tags = get_all_tags(&db);

        // Then
        assert_eq!(tags.len(), 3);
        assert_eq!(tags[0].name, "javascript");
        assert_eq!(tags[1].name, "python");
        assert_eq!(tags[2].name, "rust");
    }

    // ===== create_tag tests =====

    #[test]
    fn test_create_tag() {
        // Given
        let db = setup_db();

        // When
        let tag = super::insert_tag(&db, "rust").unwrap();

        // Then
        assert_eq!(tag.name, "rust");
        assert!(!tag.id.is_empty());

        let tags = get_all_tags(&db);
        assert_eq!(tags.len(), 1);
        assert_eq!(tags[0].name, "rust");
    }

    #[test]
    fn test_create_tag_duplicate_returns_existing() {
        // Given
        let db = setup_db();
        let first = super::insert_tag(&db, "rust").unwrap();

        // When - create same tag again
        let second = super::insert_tag(&db, "rust").unwrap();

        // Then - should return the same tag, not create a duplicate
        assert_eq!(first.id, second.id);
        assert_eq!(first.name, second.name);

        let tags = get_all_tags(&db);
        assert_eq!(tags.len(), 1);
    }

    // ===== delete_tag tests =====

    #[test]
    fn test_delete_tag() {
        // Given
        let db = setup_db();
        insert_tag_direct(&db, "t1", "rust");

        // When
        db.with_connection(|conn| {
            conn.execute("DELETE FROM tags WHERE id = ?1", ["t1"])?;
            Ok(())
        })
        .unwrap();

        // Then
        let tags = get_all_tags(&db);
        assert!(tags.is_empty());
    }

    #[test]
    fn test_delete_tag_cleans_up_snippet_tags() {
        // Given
        let db = setup_db();
        insert_tag_direct(&db, "t1", "rust");
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem) VALUES ('s1', 'Test', 'Problem')",
                [],
            )?;
            conn.execute(
                "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ('s1', 't1')",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        // When
        db.with_connection(|conn| {
            conn.execute("DELETE FROM tags WHERE id = ?1", ["t1"])?;
            Ok(())
        })
        .unwrap();

        // Then - snippet_tags junction should be cleaned up (CASCADE)
        let count: i32 = db
            .with_connection(|conn| {
                conn.query_row(
                    "SELECT COUNT(*) FROM snippet_tags WHERE tag_id = 't1'",
                    [],
                    |row| row.get(0),
                )
            })
            .unwrap();
        assert_eq!(count, 0);
    }

    // ===== snippet_tags integration tests =====

    #[test]
    fn test_snippet_tags_link() {
        // Given
        let db = setup_db();
        insert_tag_direct(&db, "t1", "rust");
        insert_tag_direct(&db, "t2", "async");
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem) VALUES ('s1', 'Async Rust', 'How to use async')",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        // When - link tags to snippet
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ('s1', 't1')",
                [],
            )?;
            conn.execute(
                "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ('s1', 't2')",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        // Then - verify links
        let count: i32 = db
            .with_connection(|conn| {
                conn.query_row(
                    "SELECT COUNT(*) FROM snippet_tags WHERE snippet_id = 's1'",
                    [],
                    |row| row.get(0),
                )
            })
            .unwrap();
        assert_eq!(count, 2);
    }

    #[test]
    fn test_snippet_tags_relink() {
        // Given - snippet with rust tag
        let db = setup_db();
        insert_tag_direct(&db, "t1", "rust");
        insert_tag_direct(&db, "t2", "python");
        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO snippets (id, title, problem) VALUES ('s1', 'Test', 'Problem')",
                [],
            )?;
            conn.execute(
                "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ('s1', 't1')",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        // When - relink to python instead
        db.with_connection(|conn| {
            conn.execute(
                "DELETE FROM snippet_tags WHERE snippet_id = 's1'",
                [],
            )?;
            conn.execute(
                "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ('s1', 't2')",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        // Then
        let tag_id: String = db
            .with_connection(|conn| {
                conn.query_row(
                    "SELECT tag_id FROM snippet_tags WHERE snippet_id = 's1'",
                    [],
                    |row| row.get(0),
                )
            })
            .unwrap();
        assert_eq!(tag_id, "t2");
    }
}
