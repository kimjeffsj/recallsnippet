use tauri::State;

use crate::db::Database;
use crate::errors::AppError;
use crate::models::{Settings, UpdateSettingsInput};

fn fetch_settings(db: &Database) -> Result<Settings, AppError> {
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
    .map_err(AppError::from)
}

#[tauri::command]
pub fn get_settings(db: State<'_, Database>) -> Result<Settings, String> {
    fetch_settings(&db).map_err(String::from)
}

#[tauri::command]
pub fn update_settings(
    db: State<'_, Database>,
    input: UpdateSettingsInput,
) -> Result<Settings, String> {
    // Build dynamic UPDATE query based on provided fields
    let mut sets: Vec<String> = vec![];
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![];

    if let Some(ref theme) = input.theme {
        sets.push(format!("theme = ?{}", sets.len() + 1));
        params.push(Box::new(theme.clone()));
    }
    if let Some(ref url) = input.ollama_base_url {
        sets.push(format!("ollama_base_url = ?{}", sets.len() + 1));
        params.push(Box::new(url.clone()));
    }
    if let Some(ref model) = input.llm_model {
        sets.push(format!("llm_model = ?{}", sets.len() + 1));
        params.push(Box::new(model.clone()));
    }
    if let Some(ref model) = input.embedding_model {
        sets.push(format!("embedding_model = ?{}", sets.len() + 1));
        params.push(Box::new(model.clone()));
    }
    if let Some(limit) = input.search_limit {
        sets.push(format!("search_limit = ?{}", sets.len() + 1));
        params.push(Box::new(limit));
    }
    if input.data_path.is_some() {
        sets.push(format!("data_path = ?{}", sets.len() + 1));
        params.push(Box::new(input.data_path.clone()));
    }

    if sets.is_empty() {
        return fetch_settings(&db).map_err(String::from);
    }

    let sql = format!("UPDATE settings SET {} WHERE id = 1", sets.join(", "));

    db.with_connection(|conn| {
        let param_refs: Vec<&dyn rusqlite::types::ToSql> =
            params.iter().map(|p| p.as_ref()).collect();
        conn.execute(&sql, param_refs.as_slice())?;
        Ok(())
    })
    .map_err(|e| AppError::Database(e).to_string())?;

    fetch_settings(&db).map_err(String::from)
}

#[cfg(test)]
mod tests {
    use crate::db::Database;
    use crate::models::{Settings, UpdateSettingsInput};

    fn setup_db() -> Database {
        Database::new_in_memory().unwrap()
    }

    fn get_settings(db: &Database) -> Settings {
        super::fetch_settings(db).unwrap()
    }

    #[test]
    fn test_get_default_settings() {
        let db = setup_db();
        let settings = get_settings(&db);

        assert_eq!(settings.theme, "dark");
        assert_eq!(settings.ollama_base_url, "http://localhost:11434");
        assert_eq!(settings.llm_model, "qwen2.5-coder:7b");
        assert_eq!(settings.embedding_model, "nomic-embed-text");
        assert_eq!(settings.search_limit, 10);
        assert!(settings.data_path.is_none());
    }

    #[test]
    fn test_update_theme() {
        let db = setup_db();

        db.with_connection(|conn| {
            conn.execute("UPDATE settings SET theme = 'light' WHERE id = 1", [])?;
            Ok(())
        })
        .unwrap();

        let settings = get_settings(&db);
        assert_eq!(settings.theme, "light");
    }

    #[test]
    fn test_update_partial_settings() {
        let db = setup_db();

        db.with_connection(|conn| {
            conn.execute(
                "UPDATE settings SET llm_model = 'llama3:8b', search_limit = 20 WHERE id = 1",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        let settings = get_settings(&db);
        assert_eq!(settings.llm_model, "llama3:8b");
        assert_eq!(settings.search_limit, 20);
        // Other fields should remain default
        assert_eq!(settings.theme, "dark");
        assert_eq!(settings.embedding_model, "nomic-embed-text");
    }

    #[test]
    fn test_update_all_settings() {
        let db = setup_db();

        db.with_connection(|conn| {
            conn.execute(
                "UPDATE settings SET theme = 'light', ollama_base_url = 'http://remote:11434',
                 llm_model = 'mistral:7b', embedding_model = 'all-minilm',
                 search_limit = 5, data_path = '/custom/path' WHERE id = 1",
                [],
            )?;
            Ok(())
        })
        .unwrap();

        let settings = get_settings(&db);
        assert_eq!(settings.theme, "light");
        assert_eq!(settings.ollama_base_url, "http://remote:11434");
        assert_eq!(settings.llm_model, "mistral:7b");
        assert_eq!(settings.embedding_model, "all-minilm");
        assert_eq!(settings.search_limit, 5);
        assert_eq!(settings.data_path.as_deref(), Some("/custom/path"));
    }

    #[test]
    fn test_settings_single_row_constraint() {
        let db = setup_db();

        // Attempt to insert a second row should fail
        let result = db.with_connection(|conn| {
            conn.execute("INSERT INTO settings (id) VALUES (2)", [])?;
            Ok(())
        });

        assert!(result.is_err());
    }

    #[test]
    fn test_settings_migration_idempotent() {
        let db = setup_db();

        // Settings should exist after migration
        let count: i32 = db
            .with_connection(|conn| {
                conn.query_row("SELECT COUNT(*) FROM settings", [], |row| row.get(0))
            })
            .unwrap();
        assert_eq!(count, 1);
    }
}
