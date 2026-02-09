# Phase 2.1: 백엔드 Snippet CRUD 구현

**날짜**: 2026-02-07
**Phase**: 2.1
**범위**: Snippet CRUD Tauri 커맨드 (create, get, list, update, delete)

---

## 변경된 파일

| 파일 | 작업 |
|------|------|
| `src-tauri/Cargo.toml` | uuid 의존성 추가 |
| `src-tauri/src/errors.rs` | 신규 - AppError enum (Database, NotFound) |
| `src-tauri/src/models/mod.rs` | 신규 - 모듈 선언 |
| `src-tauri/src/models/snippet.rs` | 신규 - Snippet, SnippetSummary, CreateSnippetInput, UpdateSnippetInput, SnippetFilter, Tag |
| `src-tauri/src/commands/mod.rs` | 신규 - 모듈 선언 |
| `src-tauri/src/commands/snippet.rs` | 신규 - 5개 CRUD 커맨드 + 14개 테스트 |
| `src-tauri/src/lib.rs` | 모듈 등록, generate_handler에 커맨드 추가 |

## 테스트 결과

- 총 19개 테스트 통과 (기존 5개 + 신규 14개)
- 실행 시간: 0.02초

---

## 구현 설명

### 왜 이렇게 구성했는가?

- **헬퍼 함수 분리**: `fetch_snippet_by_id`와 `fetch_tags_for_snippet`을 내부 헬퍼로 분리하여 커맨드 간 재사용 + 테스트에서 `tauri::State` 없이 직접 호출 가능
- **동적 SQL 빌더**: `update_snippet`과 `list_snippets`에서 선택적 필드/필터를 `Box<dyn ToSql>`로 동적 처리
- **동기(sync) 커맨드**: rusqlite는 동기 라이브러리이고, Mutex로 보호되므로 async 불필요. Tauri는 sync 커맨드도 별도 스레드에서 실행
- **직접 SQL 쿼리**: Repository 패턴 없이 SQL 직접 작성 - 프로젝트 규모가 작아 추상화 불필요

### 장점

- 코드가 단순하고 직관적
- 테스트가 `Database::new_in_memory()`로 빠르게 실행
- 헬퍼 함수 분리로 `tauri::State` 의존성 없이 로직 검증 가능
- CASCADE 삭제로 snippet_tags 정리 자동화

### 단점 / 트레이드오프

- 동적 SQL 빌더에 `Box<dyn ToSql>` 사용 → 타입 안전성 약간 떨어짐
- 테스트가 커맨드 함수 자체가 아닌 내부 헬퍼를 통해 검증 (tauri::State 모킹 제약)
- `list_snippets`에서 N+1 쿼리 (각 snippet마다 tags 별도 조회) → 로컬 앱 규모에서는 문제없음

### 대안

- **SQLx + async 풀**: 더 큰 프로젝트에 적합하지만 이 규모에서는 과도
- **JOIN + GROUP_CONCAT**: tags를 한 번에 가져올 수 있지만 파싱이 복잡해짐
- **Repository 패턴**: 테스트 모킹이 쉬워지지만 추상화 레이어가 추가됨

---

## 아키텍처 결정 기록

### 에러 처리
- `AppError` → `String` 변환으로 Tauri 커맨드 호환
- `thiserror` derive로 에러 메시지 자동 생성
- `rusqlite::Error::QueryReturnedNoRows`를 `AppError::NotFound`로 매핑

### 모델 구조
- `Snippet` (전체 필드 + tags) vs `SnippetSummary` (목록용 경량) 분리
- `UpdateSnippetInput`의 모든 필드를 `Option`으로 → 부분 업데이트 지원
- `SnippetFilter`에 `Default` derive → 빈 필터 시 전체 조회
