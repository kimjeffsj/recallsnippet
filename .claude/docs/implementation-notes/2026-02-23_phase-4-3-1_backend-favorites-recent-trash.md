# Phase 4.3-1: 백엔드 - Favorites, Recent, Trash 기능 구현

**날짜**: 2026-02-23
**Phase**: 4.3-1 (백엔드)
**범위**: DB 마이그레이션, 모델 수정, Snippet CRUD 로직 변경 (Soft Delete, Filter, Sort), 신규 커맨드 추가

---

## 변경된 파일

| 파일 | 작업 |
|------|------|
| `src-tauri/src/db/migrations.rs` | `003_add_snippet_metadata` 마이그레이션 추가 (is_favorite, is_deleted, deleted_at, last_accessed_at) |
| `src-tauri/src/models/snippet.rs` | Snippet/SnippetSummary 필드 추가, SnippetFilter 옵션 추가 |
| `src-tauri/src/commands/snippet.rs` | list_snippets(필터/정렬), delete_snippet(soft delete), get_snippet(access log), toggle/restore/permanent_delete 추가 |
| `src-tauri/src/commands/search.rs` | semantic_search 반환 모델 업데이트 |
| `src-tauri/src/commands/ai.rs` | ai_chat 내부 검색 로직 반환 모델 업데이트 |
| `src-tauri/src/lib.rs` | 신규 커맨드 등록 |

## 테스트 결과

- **Rust**: 56개 전체 통과
  - 기존 테스트 모두 통과
  - 신규 테스트: `test_toggle_favorite`, `test_restore_snippet`, `test_permanent_delete`, `test_list_snippets_filter_favorites`, `test_list_snippets_filter_trash`, `test_list_snippets_recent_first`, `test_delete_snippet_soft_delete`

---

## 구현 설명

### 왜 이렇게 구성했는가?

- **Soft Delete**: `is_deleted` 플래그와 `deleted_at` 타임스탬프를 사용하여 "휴지통" 기능을 구현했습니다. 실수로 삭제한 스니펫을 복구할 수 있는 안전 장치입니다.
- **last_accessed_at**: `get_snippet` 호출 시마다 현재 시간으로 갱신하여 "최근 본 항목" 정렬을 지원합니다.
- **필터링 로직**: `list_snippets` 내에서 동적 SQL을 구성하여 다양한 필터 조합(즐겨찾기만, 휴지통만 등)을 처리합니다.
- **단일 테이블**: 별도 테이블 분리 없이 `snippets` 테이블에 메타데이터 컬럼을 추가하여 조인 비용을 줄이고 데이터 정합성을 유지했습니다.

### 장점

- 기존 구조를 크게 해치지 않으면서 필수적인 UX 기능(즐겨찾기, 복구) 추가
- `SnippetFilter` 확장을 통해 프론트엔드에서 유연하게 목록 조회 가능
- 데이터베이스 레벨의 Soft Delete로 데이터 안전성 확보

### 단점 / 트레이드오프

- `list_snippets`의 SQL 조건문이 다소 복잡해짐
- 모든 조회 쿼리(`get_snippet`, `semantic_search`, `ai_chat`)에서 반환되는 구조체 필드를 업데이트해야 했음

### 아키텍처 결정

- **모델 변경**: `Snippet` 구조체에 필드를 추가하되, DB 컬럼은 `DEFAULT` 값을 주어 기존 데이터와의 호환성 유지
- **명시적 커맨드**: `toggle_favorite`, `restore_snippet` 등 의도가 명확한 전용 커맨드 제공 (단순 update 사용 지양)
