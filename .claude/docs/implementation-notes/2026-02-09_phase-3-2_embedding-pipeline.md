# Phase 3.2 - 임베딩 파이프라인

**날짜**: 2026-02-09
**Phase**: 3.2 (임베딩 파이프라인)
**범위**: 임베딩 생성, DB 저장, 스니펫 저장 시 자동 임베딩

## 변경된 파일

- `src-tauri/src/ai/embedding.rs` (신규) - 텍스트 전처리, 임베딩 저장/삭제, embed_snippet
- `src-tauri/src/ai/ollama.rs` (수정) - create_embedding 함수 추가 (Ollama /api/embed)
- `src-tauri/src/ai/mod.rs` (수정) - embedding 모듈 추가
- `src-tauri/src/commands/snippet.rs` (수정) - create/update를 async로 변경, 자동 임베딩

## 테스트 결과

- Rust 테스트: **37개 전체 통과** (기존 30개 + 신규 7개)
  - ollama: `test_create_embedding`, `test_similar_texts_have_higher_similarity`
  - embedding: `test_prepare_text_with_solution`, `test_prepare_text_without_solution`, `test_save_and_read_embedding`, `test_save_embedding_replaces_existing`, `test_delete_embedding`

## 구현 설명

### 왜 이렇게 구성했는가?

- **텍스트 전처리**: title을 2번 반복하여 가중치 부여 (title + title + problem + solution)
- **best-effort 임베딩**: `let _ = embed_snippet()` 패턴으로 Ollama 실패 시 무시
- **INSERT OR REPLACE**: 임베딩 업데이트 시 기존 것을 자동 교체
- **Ollama /api/embed**: 최신 Ollama API 사용 (input 필드)

### 장점

- Ollama 미실행 시에도 스니펫 생성/수정 정상 동작
- 콘텐츠 변경(title/problem/solution) 시에만 재임베딩 (불필요한 API 호출 방지)
- f32 → little-endian bytes로 BLOB 저장 (효율적 저장)

### 단점 / 트레이드오프

- 임베딩 실패 시 사용자에게 알림 없음 (Phase 3.5 검색 UI에서 처리 예정)
- 배치 임베딩 미구현 (기존 스니펫 대량 임베딩 시 하나씩 처리)
- 임베딩 모델명 하드코딩 (`nomic-embed-text`)
