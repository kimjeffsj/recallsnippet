# AI 파이프라인 가이드

## 개요

로컬 LLM(Ollama)을 활용한 시맨틱 검색과 자동 완성 기능 구현 가이드.

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        RecallSnippet                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   스니펫    │────▶│   임베딩    │────▶│   SQLite    │   │
│  │   저장      │     │   생성      │     │  + sqlite-vec│   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│                            │                    │           │
│                            ▼                    │           │
│                      ┌─────────────┐            │           │
│                      │   Ollama    │            │           │
│                      │  (로컬 LLM) │            │           │
│                      └─────────────┘            │           │
│                            ▲                    │           │
│                            │                    ▼           │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   검색      │────▶│   쿼리      │────▶│   벡터      │   │
│  │   요청      │     │   임베딩    │     │   유사도    │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Ollama 설정

### 필요한 모델

```bash
# LLM (텍스트 생성용) - 택 1
ollama pull llama3.2:3b        # 가벼움, 8GB RAM OK
ollama pull mistral:7b         # 더 강력, 16GB RAM 권장

# 임베딩 모델 (필수)
ollama pull nomic-embed-text   # 768 차원, 빠름
# 또는
ollama pull mxbai-embed-large  # 1024 차원, 더 정확
```

### Ollama API 엔드포인트

```
Base URL: http://localhost:11434

POST /api/generate      # 텍스트 생성
POST /api/embeddings    # 임베딩 생성
GET  /api/tags          # 사용 가능한 모델 목록
POST /api/chat          # 대화형 (필요시)
```

## 임베딩 파이프라인

### 1. 텍스트 전처리

```rust
fn prepare_text_for_embedding(snippet: &Snippet) -> String {
    // 제목 + 문제 + 해결책을 결합
    // 가중치: 제목에 더 높은 가중치
    format!(
        "{title} {title} {problem} {solution}",
        title = snippet.title,
        problem = snippet.problem,
        solution = snippet.solution.as_deref().unwrap_or("")
    )
}
```

### 2. 임베딩 생성 (Rust)

```rust
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct EmbeddingRequest {
    model: String,
    prompt: String,
}

#[derive(Deserialize)]
struct EmbeddingResponse {
    embedding: Vec<f32>,
}

pub async fn create_embedding(text: &str, model: &str) -> Result<Vec<f32>, AppError> {
    let client = Client::new();

    let response = client
        .post("http://localhost:11434/api/embeddings")
        .json(&EmbeddingRequest {
            model: model.to_string(),
            prompt: text.to_string(),
        })
        .send()
        .await?
        .json::<EmbeddingResponse>()
        .await?;

    Ok(response.embedding)
}
```

### 3. 임베딩 저장

```rust
pub async fn save_embedding(
    conn: &Connection,
    snippet_id: &str,
    embedding: &[f32],
    model: &str,
) -> Result<(), AppError> {
    // f32 벡터를 BLOB으로 변환
    let embedding_bytes: Vec<u8> = embedding
        .iter()
        .flat_map(|f| f.to_le_bytes())
        .collect();

    conn.execute(
        "INSERT OR REPLACE INTO embeddings (snippet_id, embedding, embedding_model, created_at)
         VALUES (?1, ?2, ?3, datetime('now'))",
        params![snippet_id, embedding_bytes, model],
    )?;

    Ok(())
}
```

## 시맨틱 검색 구현

### sqlite-vec 사용

```rust
use rusqlite::Connection;

pub fn setup_vector_search(conn: &Connection) -> Result<(), AppError> {
    // sqlite-vec 확장 로드
    conn.load_extension_enable()?;
    conn.load_extension("vec0", None)?;
    conn.load_extension_disable()?;

    // 가상 테이블 생성 (한 번만)
    conn.execute(
        "CREATE VIRTUAL TABLE IF NOT EXISTS vec_embeddings USING vec0(
            embedding float[768]  -- nomic-embed-text 차원
        )",
        [],
    )?;

    Ok(())
}
```

### 유사도 검색

```rust
pub async fn semantic_search(
    conn: &Connection,
    query: &str,
    limit: usize,
    model: &str,
) -> Result<Vec<SearchResult>, AppError> {
    // 1. 쿼리 임베딩 생성
    let query_embedding = create_embedding(query, model).await?;
    let query_bytes: Vec<u8> = query_embedding
        .iter()
        .flat_map(|f| f.to_le_bytes())
        .collect();

    // 2. 코사인 유사도로 검색
    let mut stmt = conn.prepare(
        "SELECT
            e.snippet_id,
            s.title,
            s.created_at,
            vec_distance_cosine(e.embedding, ?1) as distance
         FROM embeddings e
         JOIN snippets s ON e.snippet_id = s.id
         ORDER BY distance ASC
         LIMIT ?2"
    )?;

    let results = stmt
        .query_map(params![query_bytes, limit], |row| {
            Ok(SearchResult {
                snippet_id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                score: 1.0 - row.get::<_, f64>(3)?, // distance → similarity
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(results)
}
```

## AI 자동 완성

### 해결책 생성

```rust
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

pub async fn generate_solution(problem: &str, model: &str) -> Result<String, AppError> {
    let prompt = format!(
        r#"당신은 개발자를 돕는 AI 어시스턴트입니다.
다음 개발 문제에 대한 해결 방법을 마크다운 형식으로 작성해주세요.
간결하고 실용적인 답변을 제공하세요.

문제:
{problem}

해결 방법:"#,
        problem = problem
    );

    let client = Client::new();
    let response = client
        .post("http://localhost:11434/api/generate")
        .json(&GenerateRequest {
            model: model.to_string(),
            prompt,
            stream: false,
        })
        .send()
        .await?
        .json::<GenerateResponse>()
        .await?;

    Ok(response.response)
}
```

### 태그 추천

```rust
pub async fn suggest_tags(content: &str, model: &str) -> Result<Vec<String>, AppError> {
    let prompt = format!(
        r#"다음 개발 관련 내용을 분석하고, 적절한 태그 3-5개를 추천해주세요.
태그는 기술 스택, 카테고리, 주요 개념 등을 포함해야 합니다.
JSON 배열 형식으로만 응답하세요.

내용:
{content}

태그 (JSON 배열만):"#,
        content = content
    );

    let client = Client::new();
    let response = client
        .post("http://localhost:11434/api/generate")
        .json(&GenerateRequest {
            model: model.to_string(),
            prompt,
            stream: false,
        })
        .send()
        .await?
        .json::<GenerateResponse>()
        .await?;

    // JSON 파싱 (에러 처리 포함)
    let tags: Vec<String> = serde_json::from_str(&response.response)
        .unwrap_or_else(|_| vec![]);

    Ok(tags)
}
```

## 프론트엔드 연동

### AI 생성 UI 패턴

```tsx
function SnippetForm() {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSolution = async () => {
    if (!problem.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await aiApi.generateSolution(problem);
      setSolution(generated);
    } catch (error) {
      toast.error("AI 생성 실패");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form>
      <Textarea
        label="문제 상황"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <label>해결 방법</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerateSolution}
          disabled={isGenerating || !problem.trim()}
        >
          {isGenerating ? <Spinner /> : "🤖 AI 도움받기"}
        </Button>
      </div>

      <Textarea
        value={solution}
        onChange={(e) => setSolution(e.target.value)}
        placeholder="AI가 생성하거나 직접 작성하세요..."
      />
    </form>
  );
}
```

### 시맨틱 검색 훅

```tsx
import { useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/tauri";

export function useSemanticSearch(query: string) {
  const deferredQuery = useDeferredValue(query);

  return useQuery({
    queryKey: ["search", deferredQuery],
    queryFn: () => searchApi.semantic(deferredQuery, 10),
    enabled: deferredQuery.length > 2, // 최소 3글자
    staleTime: 1000 * 60, // 1분 캐시
  });
}
```

## 성능 최적화

### 임베딩 배치 처리

```rust
// 여러 스니펫을 한 번에 임베딩 (초기 인덱싱 시)
pub async fn batch_create_embeddings(
    snippets: &[Snippet],
    model: &str,
) -> Result<Vec<(String, Vec<f32>)>, AppError> {
    let mut results = Vec::new();

    for snippet in snippets {
        let text = prepare_text_for_embedding(snippet);
        let embedding = create_embedding(&text, model).await?;
        results.push((snippet.id.clone(), embedding));
    }

    Ok(results)
}
```

### 검색 결과 캐싱

```typescript
// TanStack Query의 staleTime 활용
const { data: results } = useQuery({
  queryKey: ["search", query],
  queryFn: () => searchApi.semantic(query, 10),
  staleTime: 1000 * 60 * 5, // 5분 캐시
  gcTime: 1000 * 60 * 10, // 10분 후 가비지 컬렉션
});
```

## 에러 처리

### Ollama 연결 실패

```rust
pub async fn check_ollama_connection() -> Result<bool, AppError> {
    let client = Client::new();

    match client.get("http://localhost:11434/api/tags").send().await {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}
```

### 프론트엔드 에러 UI

```tsx
function SearchResults({ query }: { query: string }) {
  const { data, isLoading, error } = useSemanticSearch(query);

  if (error) {
    // Ollama 연결 실패 시 안내
    if (error.message.includes("connection")) {
      return (
        <Alert variant="warning">
          <p>AI 검색을 사용하려면 Ollama가 실행 중이어야 합니다.</p>
          <code>ollama serve</code>
        </Alert>
      );
    }
    return <Alert variant="error">검색 중 오류가 발생했습니다.</Alert>;
  }

  // ...
}
```

## 테스트

### 임베딩 테스트

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_embedding() {
        // Ollama가 실행 중일 때만 테스트
        if !check_ollama_connection().await.unwrap_or(false) {
            eprintln!("Skipping test: Ollama not running");
            return;
        }

        let text = "Docker container networking issue";
        let embedding = create_embedding(text, "nomic-embed-text").await.unwrap();

        assert_eq!(embedding.len(), 768);  // nomic-embed-text 차원
        assert!(embedding.iter().all(|&v| v.is_finite()));
    }

    #[tokio::test]
    async fn test_similar_texts_have_similar_embeddings() {
        if !check_ollama_connection().await.unwrap_or(false) {
            return;
        }

        let text1 = "How to fix Docker network issue";
        let text2 = "Docker container networking problem solution";
        let text3 = "Best pizza recipes";

        let emb1 = create_embedding(text1, "nomic-embed-text").await.unwrap();
        let emb2 = create_embedding(text2, "nomic-embed-text").await.unwrap();
        let emb3 = create_embedding(text3, "nomic-embed-text").await.unwrap();

        let sim_1_2 = cosine_similarity(&emb1, &emb2);
        let sim_1_3 = cosine_similarity(&emb1, &emb3);

        // 비슷한 텍스트가 더 높은 유사도를 가져야 함
        assert!(sim_1_2 > sim_1_3);
    }
}
```
