# Phase 2.2: 백엔드 Tag CRUD 구현

**날짜**: 2026-02-07
**Phase**: 2.2
**범위**: Tag CRUD Tauri 커맨드 (list_tags, create_tag, delete_tag) + snippet_tags 연결

---

## 변경된 파일

| 파일 | 작업 |
|------|------|
| `src-tauri/src/commands/tag.rs` | 신규 - 3개 커맨드 + 8개 테스트 |
| `src-tauri/src/commands/mod.rs` | tag 모듈 등록 |
| `src-tauri/src/lib.rs` | generate_handler에 tag 커맨드 3개 추가 |

## 테스트 결과

- 총 27개 테스트 통과 (기존 19개 + 신규 8개)
- 실행 시간: 0.03초

---

## 구현 설명

### 왜 이렇게 구성했는가?

- **Tag 구조체 재사용**: Phase 2.1에서 이미 `models/snippet.rs`에 `Tag` 구조체를 정의했으므로 별도 모델 파일 불필요
- **snippet_tags 연결 로직 재사용**: `create_snippet`과 `update_snippet`에서 이미 `tag_ids`를 통한 연결/재설정 로직을 구현했으므로 별도 커맨드 불필요
- **중복 태그 방지**: `create_tag`에서 같은 이름의 태그가 있으면 기존 태그를 반환 (idempotent)
- **delete_tag 추가**: 체크리스트에는 없지만 CRUD 완성도를 위해 포함. CASCADE로 snippet_tags 자동 정리

### 장점

- 코드가 간결 - snippet 커맨드와 동일한 패턴
- `create_tag`이 idempotent하여 프론트엔드에서 안전하게 호출 가능
- `list_tags`가 이름순 정렬로 UI에서 바로 사용 가능

### 단점 / 트레이드오프

- `create_tag`에서 SELECT → INSERT 순서로 두 번 DB 접근 (단일 트랜잭션이 아님)
  - 로컬 앱에서 동시성 이슈 없으므로 무시 가능
- 태그 이름 수정 기능(rename) 미구현 - 필요 시 추후 추가

### 대안

- `INSERT OR IGNORE` + `SELECT` 패턴으로 한 번에 처리 가능하나, 반환값 처리가 복잡해짐
- tag에 `color`, `description` 등 추가 필드 고려 가능하나 현재 요구사항에 없음
