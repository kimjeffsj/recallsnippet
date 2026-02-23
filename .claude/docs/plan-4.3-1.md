# Plan 4.3-1: Favorites, Recent, Trash 기능 구현

**목표**: 스니펫 관리의 효율성을 높이기 위해 즐겨찾기, 최근 본 항목, 휴지통(Soft Delete) 기능을 구현합니다.

## 1. 백엔드 (Rust)

### 1.1 데이터베이스 마이그레이션 (`003_add_snippet_metadata.sql`)
`snippets` 테이블에 다음 컬럼을 추가합니다:
- `is_favorite`: BOOLEAN DEFAULT 0
- `is_deleted`: BOOLEAN DEFAULT 0
- `deleted_at`: DATETIME NULL
- `last_accessed_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### 1.2 모델 수정 (`src-tauri/src/models/snippet.rs`)
- `Snippet` 및 `SnippetSummary` 구조체에 새 필드 추가
- `SnippetFilter` 구조체에 `favorites_only`, `include_deleted`, `trash_only` 필터 옵션 추가

### 1.3 커맨드 업데이트 (`src-tauri/src/commands/snippet.rs`)
- **`list_snippets`**: 
  - 필터 로직 수정 (`is_deleted` 처리, `is_favorite` 처리)
  - 정렬 로직 추가 (Recent 목록용 `last_accessed_at DESC`)
- **`get_snippet`**: 
  - 조회 시 `last_accessed_at` 업데이트 로직 추가
- **`delete_snippet`**: 
  - Soft Delete로 변경 (`is_deleted = true`, `deleted_at = now`)
  - 이미 휴지통에 있는 경우 완전 삭제 로직 (선택적) 또는 별도 커맨드 분리

### 1.4 신규 커맨드 추가
- `toggle_favorite(id: i64)`: 즐겨찾기 상태 토글
- `restore_snippet(id: i64)`: 휴지통 복구 (`is_deleted = false`)
- `permanent_delete_snippet(id: i64)`: 완전 삭제 (기존 `delete_snippet` 로직)

## 2. 프론트엔드 (React)

### 2.1 타입 및 API 업데이트
- `src/lib/types.ts`: `Snippet` 인터페이스 업데이트
- `src/lib/tauri.ts`: 신규 커맨드 API 래퍼 추가
- `src/hooks/useSnippets.ts`: 
  - 필터 상태 관리 업데이트 (favorites, trash)
  - `useToggleFavorite`, `useRestoreSnippet`, `usePermanentDelete` 훅 추가

### 2.2 UI 컴포넌트 업데이트

#### Sidebar (`AppSidebar.tsx`)
- Library (전체), Favorites, Recent, Trash 메뉴 클릭 시 필터 상태 변경
- 활성 메뉴 하이라이팅 처리

#### SnippetList / HomePage
- 필터 상태에 따라 목록 조회 쿼리 파라미터 변경
- **Trash 뷰**: 
  - "휴지통 비우기" 버튼 (옵션)
  - 카드 UI에서 "복구", "완전 삭제" 액션 제공

#### SnippetCard / SnippetDetail
- **Favorite 버튼**: 제목 옆 또는 메타데이터 영역에 스타(별) 아이콘 토글 버튼
- **Delete 동작**: 
  - 일반 뷰: "Move to Trash" (Soft Delete)
  - Trash 뷰: "Delete Permanently" (Hard Delete) + "Restore"

## 3. 테스트 계획
- 백엔드: 각 커맨드별 로직 테스트 (필터링, 상태 변경 확인)
- 프론트엔드: 사이드바 네비게이션, 즐겨찾기 토글, 삭제/복구 UI 동작 테스트
