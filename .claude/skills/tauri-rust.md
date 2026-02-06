# Tauri + Rust 가이드

## 개요
이 프로젝트의 백엔드는 Tauri v2 + Rust로 구성됨.
SQLite 데이터베이스와 Ollama 연동을 담당.

## 디렉토리 구조
```
src-tauri/
├── src/
│   ├── main.rs           # 엔트리, Tauri 앱 빌더
│   ├── lib.rs            # 모듈 선언
│   ├── commands/         # Tauri IPC 커맨드
│   │   ├── mod.rs
│   │   ├── snippet.rs    # 스니펫 CRUD
│   │   ├── search.rs     # 검색 관련
│   │   ├── ai.rs         # AI/LLM 관련
│   │   └── settings.rs   # 설정 관련
│   ├── db/
│   │   ├── mod.rs
│   │   ├── connection.rs # DB 연결 관리
│   │   ├── schema.rs     # 스키마 정의
│   │   └── migrations.rs # 마이그레이션
│   ├── models/
│   │   ├── mod.rs
│   │   ├── snippet.rs    # Snippet 구조체
│   │   └── settings.rs   # Settings 구조체
│   └── ai/
│       ├── mod.rs
│       ├── ollama.rs     # Ollama API 클라이언트
│       └── embedding.rs  # 임베딩 생성
├── Cargo.toml
└── tauri.conf.json
```

## Database Schema

### snippets
```sql
CREATE TABLE snippets (
    id TEXT PRIMARY KEY,          -- UUID
    title TEXT NOT NULL,
    problem TEXT NOT NULL,        -- 마크다운
    solution TEXT,                -- 마크다운
    code TEXT,
    code_language TEXT,
    reference_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_snippets_created_at ON snippets(created_at DESC);
```

### tags
```sql
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);
```

### snippet_tags (다대다)
```sql
CREATE TABLE snippet_tags (
    snippet_id TEXT REFERENCES snippets(id) ON DELETE CASCADE,
    tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (snippet_id, tag_id)
);

CREATE INDEX idx_snippet_tags_snippet ON snippet_tags(snippet_id);
CREATE INDEX idx_snippet_tags_tag ON snippet_tags(tag_id);
```

### embeddings (벡터 검색)
```sql
CREATE TABLE embeddings (
    snippet_id TEXT PRIMARY KEY REFERENCES snippets(id) ON DELETE CASCADE,
    embedding BLOB NOT NULL,
    embedding_model TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Tauri Commands

### 패턴
```rust
use tauri::State;
use crate::db::DbPool;

#[tauri::command]
pub async fn command_name(
    state: State<'_, DbPool>,
    param: ParamType
) -> Result<ReturnType, String> {
    // 구현
    Ok(result)
}
```

### Snippet Commands
```rust
// 생성
#[tauri::command]
pub async fn create_snippet(
    db: State<'_, DbPool>,
    input: CreateSnippetInput
) -> Result<Snippet, String>

// 조회
#[tauri::command]
pub async fn get_snippet(
    db: State<'_, DbPool>,
    id: String
) -> Result<Snippet, String>

// 목록
#[tauri::command]
pub async fn list_snippets(
    db: State<'_, DbPool>,
    filter: Option<SnippetFilter>
) -> Result<Vec<SnippetSummary>, String>

// 수정
#[tauri::command]
pub async fn update_snippet(
    db: State<'_, DbPool>,
    id: String,
    input: UpdateSnippetInput
) -> Result<Snippet, String>

// 삭제
#[tauri::command]
pub async fn delete_snippet(
    db: State<'_, DbPool>,
    id: String
) -> Result<(), String>
```

### Search Commands
```rust
#[tauri::command]
pub async fn semantic_search(
    db: State<'_, DbPool>,
    query: String,
    limit: Option<usize>  // default: 10
) -> Result<Vec<SearchResult>, String>

#[tauri::command]
pub async fn search_by_tags(
    db: State<'_, DbPool>,
    tags: Vec<String>
) -> Result<Vec<SnippetSummary>, String>
```

### AI Commands
```rust
#[tauri::command]
pub async fn generate_solution(
    problem: String,
    model: Option<String>
) -> Result<String, String>

#[tauri::command]
pub async fn suggest_tags(
    content: String
) -> Result<Vec<String>, String>

#[tauri::command]
pub async fn list_ollama_models() -> Result<Vec<String>, String>
```

## 주요 Dependencies (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2", features = ["devtools"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
rusqlite = { version = "0.31", features = ["bundled"] }
uuid = { version = "1", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
reqwest = { version = "0.11", features = ["json"] }
anyhow = "1"
thiserror = "1"
```

## 에러 처리 패턴

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Ollama error: {0}")]
    Ollama(String),
}

// Tauri 커맨드에서 사용
impl From<AppError> for String {
    fn from(err: AppError) -> Self {
        err.to_string()
    }
}
```

## Ollama 연동

### API 엔드포인트
```
POST http://localhost:11434/api/generate   # 텍스트 생성
POST http://localhost:11434/api/embeddings # 임베딩 생성
GET  http://localhost:11434/api/tags       # 모델 목록
```

### 임베딩 생성 예시
```rust
pub async fn create_embedding(text: &str) -> Result<Vec<f32>, AppError> {
    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:11434/api/embeddings")
        .json(&serde_json::json!({
            "model": "nomic-embed-text",
            "prompt": text
        }))
        .send()
        .await?
        .json::<EmbeddingResponse>()
        .await?;
    
    Ok(response.embedding)
}
```

## 코딩 컨벤션

### 네이밍
- 함수/변수: `snake_case`
- 구조체/열거형: `PascalCase`
- 상수: `SCREAMING_SNAKE_CASE`

### 테스트
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function_name() {
        // Given
        let input = ...;
        
        // When
        let result = function_name(input);
        
        // Then
        assert_eq!(result, expected);
    }
}
```

### 주석
```rust
/// 함수 설명 (public 함수에만)
/// 
/// # Arguments
/// * `param` - 파라미터 설명
/// 
/// # Returns
/// 반환값 설명
pub fn function_name(param: Type) -> ReturnType {
    // 복잡한 로직에만 인라인 주석
}
```
