use rusqlite::Connection;

/// Run all database migrations
pub fn run_all(conn: &Connection) -> Result<(), rusqlite::Error> {
    // Create migrations table to track applied migrations
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );"
    )?;

    // Run each migration if not already applied
    run_migration(conn, "001_initial_schema", create_initial_schema)?;

    Ok(())
}

fn run_migration<F>(conn: &Connection, name: &str, migration_fn: F) -> Result<(), rusqlite::Error>
where
    F: FnOnce(&Connection) -> Result<(), rusqlite::Error>,
{
    // Check if migration already applied
    let already_applied: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM migrations WHERE name = ?)",
        [name],
        |row| row.get(0),
    )?;

    if already_applied {
        return Ok(());
    }

    // Run migration
    migration_fn(conn)?;

    // Record migration
    conn.execute(
        "INSERT INTO migrations (name) VALUES (?)",
        [name],
    )?;

    Ok(())
}

fn create_initial_schema(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        r#"
        -- Snippets table
        CREATE TABLE snippets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            problem TEXT NOT NULL,
            solution TEXT,
            code TEXT,
            code_language TEXT,
            reference_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_snippets_created_at ON snippets(created_at DESC);

        -- Tags table
        CREATE TABLE tags (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL
        );

        -- Snippet-Tags junction table (many-to-many)
        CREATE TABLE snippet_tags (
            snippet_id TEXT REFERENCES snippets(id) ON DELETE CASCADE,
            tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (snippet_id, tag_id)
        );

        CREATE INDEX idx_snippet_tags_snippet ON snippet_tags(snippet_id);
        CREATE INDEX idx_snippet_tags_tag ON snippet_tags(tag_id);

        -- Embeddings table for vector search
        CREATE TABLE embeddings (
            snippet_id TEXT PRIMARY KEY REFERENCES snippets(id) ON DELETE CASCADE,
            embedding BLOB NOT NULL,
            embedding_model TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        "#
    )?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_migrations_are_idempotent() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys = ON;").unwrap();

        // Run migrations twice
        run_all(&conn).unwrap();
        run_all(&conn).unwrap();

        // Should have exactly one migration recorded
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM migrations",
            [],
            |row| row.get(0),
        ).unwrap();

        assert_eq!(count, 1);
    }

    #[test]
    fn test_cascade_delete_snippet_tags() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys = ON;").unwrap();
        run_all(&conn).unwrap();

        // Insert snippet and tag
        conn.execute(
            "INSERT INTO snippets (id, title, problem) VALUES ('s1', 'Test', 'Problem')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT INTO tags (id, name) VALUES ('t1', 'rust')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ('s1', 't1')",
            [],
        ).unwrap();

        // Delete snippet
        conn.execute("DELETE FROM snippets WHERE id = 's1'", []).unwrap();

        // Junction table should be empty
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM snippet_tags",
            [],
            |row| row.get(0),
        ).unwrap();

        assert_eq!(count, 0);
    }
}
