use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::db::migrations;

/// Database wrapper for thread-safe SQLite access
pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    /// Create a new database connection at the specified path
    pub fn new(db_path: PathBuf) -> Result<Self, rusqlite::Error> {
        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;

        // Enable foreign keys
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;

        let db = Self {
            conn: Mutex::new(conn),
        };

        // Run migrations
        db.run_migrations()?;

        Ok(db)
    }

    /// Create an in-memory database (for testing)
    pub fn new_in_memory() -> Result<Self, rusqlite::Error> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;

        let db = Self {
            conn: Mutex::new(conn),
        };

        db.run_migrations()?;

        Ok(db)
    }

    /// Run all migrations
    fn run_migrations(&self) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        migrations::run_all(&conn)
    }

    /// Execute a function with a connection reference
    pub fn with_connection<F, T>(&self, f: F) -> Result<T, rusqlite::Error>
    where
        F: FnOnce(&Connection) -> Result<T, rusqlite::Error>,
    {
        let conn = self.conn.lock().unwrap();
        f(&conn)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_in_memory_database() {
        let db = Database::new_in_memory();
        assert!(db.is_ok());
    }

    #[test]
    fn test_database_tables_exist() {
        let db = Database::new_in_memory().unwrap();

        let result = db.with_connection(|conn| {
            let mut stmt = conn.prepare(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            )?;

            let tables: Vec<String> = stmt
                .query_map([], |row| row.get(0))?
                .filter_map(|r| r.ok())
                .collect();

            Ok(tables)
        });

        let tables = result.unwrap();
        assert!(tables.contains(&"snippets".to_string()));
        assert!(tables.contains(&"tags".to_string()));
        assert!(tables.contains(&"snippet_tags".to_string()));
        assert!(tables.contains(&"embeddings".to_string()));
    }

    #[test]
    fn test_foreign_keys_enabled() {
        let db = Database::new_in_memory().unwrap();

        let fk_enabled = db.with_connection(|conn| {
            conn.query_row("PRAGMA foreign_keys", [], |row| row.get::<_, i32>(0))
        }).unwrap();

        assert_eq!(fk_enabled, 1);
    }
}
