# Phase 3.3 - 시맨틱 검색

**날짜**: 2026-02-09
**Phase**: 3.3 (시맨틱 검색)
**범위**: 코사인 유사도 기반 벡터 검색 구현

## 변경된 파일

- `src-tauri/src/commands/search.rs` (신규) - semantic_search 커맨드 + 유사도 계산
- `src-tauri/src/commands/mod.rs` (수정) - search 모듈 추가
- `src-tauri/src/models/snippet.rs` (수정) - SearchResult 구조체 추가
- `src-tauri/src/lib.rs` (수정) - semantic_search 커맨드 등록

## 테스트 결과

- Rust 테스트: **44개 전체 통과** (기존 37개 + 신규 7개)
  - `test_cosine_similarity_identical/orthogonal/opposite/empty/zero_magnitude`
  - `test_decode_embedding`
  - `test_semantic_search_db_integration` (가짜 임베딩으로 랭킹 검증)

## 구현 설명

### 왜 이렇게 구성했는가?

- **sqlite-vec 대신 순수 Rust 코사인 유사도**: sqlite-vec 확장은 플랫폼별 바이너리 로드가 필요하고 cross-compile 이슈 발생 가능. 순수 Rust로 구현하면 의존성 0개.
- **전체 임베딩 로드 후 계산**: 현재 규모(개인 지식 베이스)에서는 수천 개 스니펫도 밀리초 단위로 처리 가능.

### 장점

- 외부 확장 의존성 없음 (cross-platform 빌드 안정)
- f64로 유사도 계산 (정밀도 유지)
- SearchResult에 score 포함하여 프론트엔드에서 관련도 표시 가능

### 단점 / 트레이드오프

- 수만 개 이상 스니펫 시 메모리/성능 이슈 가능 (sqlite-vec로 전환 고려)
- 현재 모든 임베딩을 메모리에 로드 (대규모 시 페이징 필요)

### 아키텍처 결정

sqlite-vec 대신 순수 Rust 구현을 선택한 이유:
1. Tauri 앱은 macOS/Windows 크로스 플랫폼 → 확장 로드 복잡
2. 개인 지식 베이스 규모에서는 brute-force 검색이 충분히 빠름
3. 추후 규모가 커지면 sqlite-vec이나 HNSW 인덱스로 전환 가능
