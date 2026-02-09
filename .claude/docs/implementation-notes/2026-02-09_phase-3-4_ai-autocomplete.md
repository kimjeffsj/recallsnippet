# Phase 3.4 - AI 자동 완성

**날짜**: 2026-02-09
**Phase**: 3.4 (AI 자동 완성)
**범위**: generate_solution, suggest_tags 커맨드, 프롬프트 템플릿

## 변경된 파일

- `src-tauri/src/ai/ollama.rs` (수정) - generate 함수 추가 (Ollama /api/generate)
- `src-tauri/src/commands/ai.rs` (수정) - generate_solution, suggest_tags 커맨드 + parse_tags_from_response
- `src-tauri/src/lib.rs` (수정) - 커맨드 등록

## 테스트 결과

- Rust 테스트: **49개 전체 통과** (기존 44개 + 신규 5개)
  - `test_parse_tags_direct_json`, `test_parse_tags_with_surrounding_text`
  - `test_parse_tags_with_newlines`, `test_parse_tags_invalid_returns_empty`
  - `test_parse_tags_empty_array`

## 구현 설명

### 왜 이렇게 구성했는가?

- **영어 프롬프트**: LLM이 영어를 더 잘 이해하고 코드 관련 응답 품질이 높음
- **stream: false**: 단순 구현 우선, 추후 스트리밍 지원 가능
- **parse_tags_from_response**: LLM이 JSON만 반환하지 않을 수 있으므로 3단계 파싱
  1. 직접 JSON 파싱
  2. 텍스트에서 JSON 배열 추출
  3. 실패 시 빈 배열 반환
- **기본 모델**: qwen2.5-coder:7b (코드 특화, CLAUDE.md 설정 기준)

### 장점

- 120초 타임아웃으로 큰 응답도 처리
- 프롬프트가 명확하고 포맷 제약 있음 (JSON array only)
- 파싱 실패 시 graceful fallback

### 단점 / 트레이드오프

- 스트리밍 미지원 (긴 생성 시 사용자가 대기해야 함)
- 모델명 하드코딩 (Phase 4 설정에서 변경 가능하게 할 예정)
- LLM 응답 품질은 로컬 모델 크기에 의존
