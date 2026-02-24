use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct EmbeddingRequest {
    model: String,
    input: String,
}

#[derive(Deserialize)]
struct EmbeddingResponse {
    embeddings: Vec<Vec<f32>>,
}

#[derive(Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Deserialize)]
struct OllamaModel {
    name: String,
}

/// Check if Ollama is running and reachable
pub async fn check_connection(base_url: &str) -> Result<bool, String> {
    let client = Client::new();

    match client
        .get(format!("{}/api/tags", base_url))
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
    {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}

/// List available Ollama models
pub async fn list_models(base_url: &str) -> Result<Vec<String>, String> {
    let client = Client::new();

    let response = client
        .get(format!("{}/api/tags", base_url))
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

#[derive(Serialize)]
struct GenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
}

#[derive(Deserialize)]
struct GenerateResponse {
    response: String,
}

/// Generate text using Ollama LLM
pub async fn generate(prompt: &str, model: &str, base_url: &str) -> Result<String, String> {
    let client = Client::new();

    let response = client
        .post(format!("{}/api/generate", base_url))
        .json(&GenerateRequest {
            model: model.to_string(),
            prompt: prompt.to_string(),
            stream: false,
        })
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("Ollama generation failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Ollama generation returned status: {}",
            response.status()
        ));
    }

    let gen_response: GenerateResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse generation response: {}", e))?;

    Ok(gen_response.response)
}

/// Create an embedding vector for the given text
pub async fn create_embedding(text: &str, model: &str, base_url: &str) -> Result<Vec<f32>, String> {
    let client = Client::new();

    let response = client
        .post(format!("{}/api/embed", base_url))
        .json(&EmbeddingRequest {
            model: model.to_string(),
            input: text.to_string(),
        })
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| format!("Ollama embedding request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Ollama embedding returned status: {}",
            response.status()
        ));
    }

    let emb_response: EmbeddingResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse embedding response: {}", e))?;

    emb_response
        .embeddings
        .into_iter()
        .next()
        .ok_or_else(|| "No embedding returned".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    const DEFAULT_OLLAMA_BASE_URL: &str = "http://localhost:11434";

    #[tokio::test]
    async fn test_check_connection() {
        // This test will pass whether Ollama is running or not
        let result = check_connection(DEFAULT_OLLAMA_BASE_URL).await;
        assert!(result.is_ok());
        // result is Ok(true) if running, Ok(false) if not
    }

    #[tokio::test]
    async fn test_list_models_when_ollama_not_running() {
        // If Ollama is not running, this should return an error
        let connected = check_connection(DEFAULT_OLLAMA_BASE_URL)
            .await
            .unwrap_or(false);
        if !connected {
            let result = list_models(DEFAULT_OLLAMA_BASE_URL).await;
            assert!(result.is_err());
        }
    }

    #[tokio::test]
    async fn test_list_models_when_ollama_running() {
        let connected = check_connection(DEFAULT_OLLAMA_BASE_URL)
            .await
            .unwrap_or(false);
        if !connected {
            eprintln!("Skipping test: Ollama not running");
            return;
        }

        let models = list_models(DEFAULT_OLLAMA_BASE_URL).await.unwrap();
        assert!(!models.is_empty());
    }

    #[tokio::test]
    async fn test_create_embedding() {
        let connected = check_connection(DEFAULT_OLLAMA_BASE_URL)
            .await
            .unwrap_or(false);
        if !connected {
            eprintln!("Skipping test: Ollama not running");
            return;
        }

        let text = "Docker container networking issue";
        let embedding = create_embedding(text, "nomic-embed-text", DEFAULT_OLLAMA_BASE_URL)
            .await
            .unwrap();

        // nomic-embed-text produces 768-dimensional embeddings
        assert_eq!(embedding.len(), 768);
        assert!(embedding.iter().all(|&v| v.is_finite()));
    }

    #[tokio::test]
    async fn test_similar_texts_have_higher_similarity() {
        let connected = check_connection(DEFAULT_OLLAMA_BASE_URL)
            .await
            .unwrap_or(false);
        if !connected {
            eprintln!("Skipping test: Ollama not running");
            return;
        }

        let emb1 = create_embedding(
            "How to fix Docker network issue",
            "nomic-embed-text",
            DEFAULT_OLLAMA_BASE_URL,
        )
        .await
        .unwrap();
        let emb2 = create_embedding(
            "Docker container networking problem",
            "nomic-embed-text",
            DEFAULT_OLLAMA_BASE_URL,
        )
        .await
        .unwrap();
        let emb3 = create_embedding(
            "Best pizza recipes for dinner",
            "nomic-embed-text",
            DEFAULT_OLLAMA_BASE_URL,
        )
        .await
        .unwrap();

        let sim_1_2 = cosine_similarity(&emb1, &emb2);
        let sim_1_3 = cosine_similarity(&emb1, &emb3);

        // Similar texts should have higher cosine similarity
        assert!(
            sim_1_2 > sim_1_3,
            "Expected sim(docker, docker) > sim(docker, pizza): {} vs {}",
            sim_1_2,
            sim_1_3
        );
    }

    fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let mag_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let mag_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
        if mag_a == 0.0 || mag_b == 0.0 {
            return 0.0;
        }
        dot / (mag_a * mag_b)
    }
}
