use reqwest::Client;
use serde::Deserialize;

const OLLAMA_BASE_URL: &str = "http://localhost:11434";

#[derive(Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Deserialize)]
struct OllamaModel {
    name: String,
}

/// Check if Ollama is running and reachable
pub async fn check_connection() -> Result<bool, String> {
    let client = Client::new();

    match client
        .get(format!("{}/api/tags", OLLAMA_BASE_URL))
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
    {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}

/// List available Ollama models
pub async fn list_models() -> Result<Vec<String>, String> {
    let client = Client::new();

    let response = client
        .get(format!("{}/api/tags", OLLAMA_BASE_URL))
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await
        .map_err(|e| format!("Ollama connection failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama returned status: {}", response.status()));
    }

    let tags_response: OllamaTagsResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    Ok(tags_response.models.into_iter().map(|m| m.name).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_check_connection() {
        // This test will pass whether Ollama is running or not
        let result = check_connection().await;
        assert!(result.is_ok());
        // result is Ok(true) if running, Ok(false) if not
    }

    #[tokio::test]
    async fn test_list_models_when_ollama_not_running() {
        // If Ollama is not running, this should return an error
        let connected = check_connection().await.unwrap_or(false);
        if !connected {
            let result = list_models().await;
            assert!(result.is_err());
        }
    }

    #[tokio::test]
    async fn test_list_models_when_ollama_running() {
        let connected = check_connection().await.unwrap_or(false);
        if !connected {
            eprintln!("Skipping test: Ollama not running");
            return;
        }

        let models = list_models().await.unwrap();
        assert!(!models.is_empty());
    }
}
