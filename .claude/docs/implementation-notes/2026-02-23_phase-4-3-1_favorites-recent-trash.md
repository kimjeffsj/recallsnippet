# Phase 4.3-1: Favorites, Recent, Trash 기능 구현 (Full Stack)

**날짜**: 2026-02-23
**Phase**: 4.3-1
**범위**: 백엔드(DB, Commands) + 프론트엔드(UI, Hooks, State) 전체 구현

---

## 변경된 파일

### Backend (Rust)
- `src-tauri/src/db/migrations.rs`: `003_add_snippet_metadata` 마이그레이션 (is_favorite, is_deleted, deleted_at, last_accessed_at)
- `src-tauri/src/models/snippet.rs`: `Snippet`, `SnippetSummary` 필드 추가 / `SnippetFilter` 옵션 추가 (favorites_only, trash_only, recent_first 등)
- `src-tauri/src/commands/snippet.rs`: 
  - `list_snippets`: 필터링 및 정렬 로직 강화
  - `delete_snippet`: Soft Delete로 변경
  - `get_snippet`: 조회 시 `last_accessed_at` 갱신
  - 신규 커맨드: `toggle_favorite`, `restore_snippet`, `permanent_delete_snippet`
- `src-tauri/src/commands/search.rs` / `ai.rs`: 조회 쿼리 업데이트
- `src-tauri/src/lib.rs`: 신규 커맨드 등록

### Frontend (React/TS)
- `src/lib/types.ts`: `Snippet`, `SnippetFilter` 등 타입 정의 업데이트
- `src/lib/tauri.ts`: 신규 API 메서드 추가
- `src/hooks/useSnippets.ts`: `useToggleFavorite`, `useRestoreSnippet`, `usePermanentDeleteSnippet` 훅 추가
- `src/contexts/AppContext.tsx`: `activeFolder` 상태 추가 (sidebar navigation용)
- `src/components/layout/AppSidebar.tsx`: Library/Favorites/Recent/Trash 네비게이션 연동
- `src/pages/HomePage.tsx`: `activeFolder`에 따른 필터링, 삭제/복구 로직 분기
- `src/components/snippet/SnippetCard.tsx`: 즐겨찾기(별) 아이콘 표시, 삭제된 항목 스타일링
- `src/components/snippet/SnippetDetail.tsx`: 즐겨찾기 토글, 복구/영구삭제 버튼 UI 구현

## 테스트 결과

- **Rust Tests**: 56개 전체 통과
  - 신규 기능(Soft Delete, Restore, Toggle Favorite, Filtering) 검증 완료
- **Frontend Tests**: 99개 전체 통과
  - 기존 컴포넌트 회귀 테스트 통과
  - 신규 UI/Interaction 로직 검증 완료

---

## 구현 설명

### 왜 이렇게 구성했는가?

1.  **Soft Delete 전략**:
    - 실수로 인한 데이터 손실 방지를 위해 즉시 삭제 대신 `is_deleted` 플래그를 사용했습니다.
    - 휴지통(`Trash`) 폴더에서만 영구 삭제가 가능하도록 하여 안정성을 높였습니다.

2.  **Folder 기반 네비게이션**:
    - 사이드바 메뉴(Favorites, Recent 등)를 `activeFolder` 상태로 관리하여, URL 라우팅 없이도 논리적인 뷰 전환을 구현했습니다.
    - `HomePage`에서 `activeFolder` 값에 따라 `SnippetFilter`를 동적으로 생성하여 `list_snippets`에 전달하는 방식으로 데이터 소스를 일원화했습니다.

3.  **Last Accessed At**:
    - `get_snippet` (상세 조회) 시점에 타임스탬프를 갱신하여 별도의 "최근 본 항목" 테이블 없이도 정렬만으로 기능을 구현했습니다.

### 장점

- **확장성**: `SnippetFilter` 구조를 유연하게 설계하여 향후 태그+즐겨찾기 등 복합 필터링도 쉽게 지원 가능
- **UX 향상**: 중요한 스니펫을 즐겨찾기하고, 최근 작업한 내용을 바로 찾을 수 있어 생산성 증대
- **데이터 안전**: 휴지통 기능으로 심리적 안정감 제공

### 단점 / 트레이드오프

- `list_snippets`의 복잡도 증가: 다양한 필터 조합을 처리하기 위해 SQL 생성 로직이 길어졌습니다. (추후 Query Builder 도입 고려 가능)
- `AppSidebar`의 상태 의존성: `activeFolder`와 `filterLanguage` 간의 상호작용(예: 폴더 변경 시 언어 필터 초기화 등)을 세심하게 관리해야 했습니다.

---

## 다음 단계

- 이제 핵심 기능 구현이 완료되었으므로, 문서화(README 업데이트) 및 최종 릴리즈 빌드 점검을 진행할 수 있습니다.
