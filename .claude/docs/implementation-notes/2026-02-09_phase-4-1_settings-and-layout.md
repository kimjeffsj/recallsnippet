# Phase 4.1-4.2.2 구현 노트: Settings + Layout 재구성

**날짜**: 2026-02-09
**Phase**: 4.1.1 ~ 4.2.2 (진행 중)
**범위**: Settings 백엔드/프론트, 테마 시스템, SettingsDialog, 레이아웃 재구성, SnippetCard 모델 확장

---

## 변경된 파일

### 새 파일
- `src-tauri/src/models/settings.rs` — Settings, UpdateSettingsInput 구조체 + Default impl
- `src-tauri/src/commands/settings.rs` — get_settings, update_settings 커맨드 + 6개 테스트
- `src/hooks/useSettings.ts` — useSettings(), useUpdateSettings() 훅
- `src/hooks/useTheme.ts` — settings 기반 dark/light 토글
- `src/components/settings/SettingsDialog.tsx` — 3섹션 (Appearance/AI/Storage)
- `src/components/layout/AppHeader.tsx` — 로고 + 중앙 검색바(⌘K) + New Snippet + Settings
- `src/components/layout/AppSidebar.tsx` — 네비게이션 + 언어 필터(색상점) + Ollama 상태
- `src/contexts/AppContext.tsx` — useReducer 기반 공유 상태 (view, selectedId, searchQuery 등)
- `src/lib/language-colors.ts` — 23개 언어 색상/약어 맵

### 수정 파일
- `src-tauri/src/db/migrations.rs` — 002_settings_table 마이그레이션 추가
- `src-tauri/src/models/mod.rs` — settings 모듈 추가
- `src-tauri/src/commands/mod.rs` — settings 모듈 추가
- `src-tauri/src/lib.rs` — get_settings, update_settings 커맨드 등록
- `src-tauri/src/ai/ollama.rs` — 모든 함수에 `base_url: &str` 파라미터 추가 (상수 → 인자)
- `src-tauri/src/ai/embedding.rs` — `embed_snippet`에 embedding_model, base_url 파라미터 추가
- `src-tauri/src/commands/ai.rs` — settings에서 모델/URL 읽기, State<Database> 추가
- `src-tauri/src/commands/search.rs` — settings에서 limit/model 읽기
- `src-tauri/src/commands/snippet.rs` — embed 호출에 settings 전달
- `src-tauri/src/models/snippet.rs` — SnippetSummary에 `code_preview: Option<String>` 추가
- `src/lib/types.ts` — Settings, UpdateSettingsInput, SnippetSummary.codePreview 추가
- `src/lib/tauri.ts` — settingsApi 추가
- `src/index.css` — DESIGN.md 색상 팔레트, Inter/JetBrains Mono 폰트, 스크롤바
- `src/App.tsx` — 마운트 시 테마 초기화
- `src/components/layout/MainLayout.tsx` — header + sidebar + content 3파트 구조로 재작성
- `src/pages/HomePage.tsx` — AppContext/AppProvider 활용으로 재작성 (prop drilling 제거)

---

## 테스트 결과
- Rust: 55개 통과 (기존 49 + 신규 6개 settings 테스트)
- Frontend: 55개 통과 (기존 테스트 유지, UI 변경 후 업데이트 예정)

---

## 아키텍처 결정

### Settings: 단일 행 패턴
- `CHECK (id = 1)` 제약으로 항상 1개 행만 존재
- 마이그레이션에서 기본값과 함께 INSERT
- `get_settings_internal()` 헬퍼로 각 커맨드에서 Settings 읽기 (DB → Settings struct)

### Ollama 파라미터화
- 기존 `OLLAMA_BASE_URL` 상수 → `base_url: &str` 파라미터로 변경
- 모든 ollama 함수(check_connection, list_models, generate, create_embedding)에 적용
- commands 레벨에서 settings 읽어서 전달

### AppContext: useReducer 패턴
- prop drilling 제거를 위해 Context + useReducer 도입
- AppProvider가 HomePage를 감싸서 모든 자식이 상태 접근 가능
- 액션: SET_VIEW, SELECT_SNIPPET, DESELECT_SNIPPET, SET_SEARCH_QUERY, SET_FILTER_LANGUAGE, TOGGLE_SIDEBAR, SET_SETTINGS_OPEN, NAVIGATE_TO_CREATE, NAVIGATE_TO_LIST

---

## 남은 작업 (4.2.2 이후)

1. **SnippetCard.tsx 재작성** — 카드형 디자인 (언어 뱃지 + 코드 프리뷰 + 태그 + timeAgo)
2. **4.2.3 SnippetList 그리드** — `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
3. **4.2.4 SnippetDetail 2-column** — 좌: 코드/AI, 우: 메타/관련 스니펫
4. **4.2.5 SnippetForm 리디자인**
5. **4.2.6 Empty/Loading/Error 상태 컴포넌트**
6. **4.2.7 키보드 단축키** (⌘K 이미 AppHeader에 구현, ⌘N/Escape 추가)
7. **4.2.8 반응형 + HomePage 통합**
8. **4.2.9 테스트 업데이트** (변경된 마크업 반영)
9. **4.3 빌드**, **4.4 문서화**

## 주의사항 (다음 에이전트용)

- `SnippetCard.tsx` 파일은 아직 **기존 코드 그대로**임. 재작성 필요.
- test 파일의 SnippetSummary mock에 `codePreview` 필드 추가 필요
- Favorites/Recent/Trash 사이드바 항목은 **UI placeholder** (disabled, onClick 미구현)
- `list_snippets` SQL은 `SUBSTR(code, 1, 200)` 로 code_preview 반환
- `SettingsDialog` 테스트 아직 미작성 (4.2.9에서 일괄 처리 예정)
