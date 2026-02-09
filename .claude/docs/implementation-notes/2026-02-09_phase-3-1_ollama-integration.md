# Phase 3.1 - Ollama 연동

**날짜**: 2026-02-09
**Phase**: 3.1 (Ollama 연동)
**범위**: Ollama 연결 확인, 모델 목록 조회, 에러 처리

## 변경된 파일

- `src-tauri/src/ai/mod.rs` (신규) - AI 모듈 선언
- `src-tauri/src/ai/ollama.rs` (신규) - Ollama API 클라이언트 (check_connection, list_models)
- `src-tauri/src/commands/ai.rs` (신규) - Tauri 커맨드 (check_ollama_connection, list_ollama_models)
- `src-tauri/src/commands/mod.rs` (수정) - ai 모듈 추가
- `src-tauri/src/lib.rs` (수정) - ai 모듈 + 커맨드 등록
- `src-tauri/src/errors.rs` (수정) - Ollama 에러 변형 추가

## 테스트 결과

- Rust 테스트: **30개 전체 통과** (기존 27개 + 신규 3개)
  - `test_check_connection`: 연결 여부 관계없이 Ok 반환 확인
  - `test_list_models_when_ollama_not_running`: 미실행 시 에러 반환
  - `test_list_models_when_ollama_running`: 실행 중일 때 모델 목록 반환

## 구현 설명

### 왜 이렇게 구성했는가?

- **ai/ollama.rs 분리**: Ollama API 호출 로직을 독립 모듈로 분리하여 추후 임베딩/생성 기능 추가 시 확장 용이
- **timeout 설정**: 연결 확인 3초, 모델 목록 5초 제한으로 UI 블로킹 방지
- **check_connection은 Ok(bool) 반환**: 연결 실패도 정상 흐름 (에러가 아닌 false)

### 장점

- Ollama 미실행 시에도 앱 정상 동작 (graceful degradation)
- reqwest가 이미 의존성에 있어 추가 패키지 불필요
- 테스트가 Ollama 실행 여부에 관계없이 통과

### 단점 / 트레이드오프

- OLLAMA_BASE_URL이 하드코딩 (추후 설정에서 변경 가능하게 할 수 있음)
- 동기적 API 호출 (스트리밍 미지원) - Phase 3.4에서 필요시 추가
