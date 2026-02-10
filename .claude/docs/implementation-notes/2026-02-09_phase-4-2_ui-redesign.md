# Phase 4.2 구현 노트: UI 리디자인

**날짜**: 2026-02-09
**Phase**: 4.2.2 ~ 4.2.9
**범위**: SnippetCard/List 카드그리드, SnippetDetail 2-column, SnippetForm 리디자인, CodeBlock 헤더, 상태 컴포넌트, 키보드 단축키, 테스트

---

## 변경된 파일

### 새 파일
- `src/components/shared/EmptyState.tsx` — 재사용 empty state (icon + title + desc + CTA)
- `src/components/shared/ErrorState.tsx` — 에러 상태 (AlertTriangle + 메시지 + 재시도)
- `src/hooks/useKeyboardShortcuts.ts` — ⌘N(새 스니펫), Escape(뒤로)
- `src/components/layout/AppHeader.test.tsx` — 5개 테스트
- `src/components/layout/AppSidebar.test.tsx` — 3개 테스트
- `src/components/shared/EmptyState.test.tsx` — 4개 테스트
- `src/components/shared/ErrorState.test.tsx` — 4개 테스트

### 수정 파일
- `src/components/snippet/SnippetCard.tsx` — 카드형 재작성 (언어뱃지 + 코드프리뷰 + 태그 + timeAgo)
- `src/components/snippet/SnippetList.tsx` — grid 레이아웃 + 스켈레톤 로딩 + 카운트 헤더
- `src/components/snippet/SnippetDetail.tsx` — 2-column (좌: 콘텐츠 + AI bar, 우: 메타 + 태그)
- `src/components/snippet/SnippetForm.tsx` — 헤더 Back/Save, Title+Lang 한 행, pill 태그
- `src/components/snippet/CodeBlock.tsx` — 트래픽라이트 + 파일명 + Copy 버튼 헤더
- `src/pages/HomePage.tsx` — onBack prop 연결, useKeyboardShortcuts 통합
- `src/components/snippet/SnippetCard.test.tsx` — 새 마크업 반영 (8개 테스트)
- `src/components/snippet/SnippetList.test.tsx` — 스켈레톤/카운트 반영 (6개 테스트)
- `src/components/snippet/SnippetForm.test.tsx` — Cancel→Go back 반영
- `src/pages/HomePage.test.tsx` — codePreview + empty state 텍스트 반영
- `src/hooks/useSnippets.test.tsx` — codePreview 필드 추가
- `src/components/search/SearchResults.test.tsx` — codePreview 필드 추가

---

## 테스트 결과
- **Rust**: 55개 통과
- **Frontend**: 74개 통과 (기존 55 → 58 → 74)
- **Total**: 129개 통과

---

## 아키텍처 결정

### SnippetCard: timeAgo 함수
- 외부 라이브러리(date-fns, dayjs) 없이 순수 JS로 구현
- "just now" / "Xm ago" / "Xh ago" / "Xd ago" 4단계

### SnippetDetail: 2-column
- `flex-col lg:flex-row`로 반응형 처리
- 좌측: 타이틀, Problem, Solution, Code, AI Action Bar
- 우측: Details 카드(날짜, URL), Tags 카드
- onBack prop (optional) 으로 뒤로가기 버튼 조건 렌더링

### CodeBlock: Copy to clipboard
- `navigator.clipboard.writeText` 사용
- 2초 후 "Copied" → "Copy" 복귀
- hover시만 보이는 복사 버튼 (opacity-0 group-hover:opacity-100)

### SnippetForm: form id 패턴
- `<form id="snippet-form">` + `<Button form="snippet-form">` 로 헤더의 Save 버튼과 폼 연결
- 이를 통해 Save 버튼을 폼 바깥(헤더)에 배치 가능

### useKeyboardShortcuts
- input/textarea 내에서는 Escape만 동작 (나머지 무시)
- ⌘K는 AppHeader에서 별도 처리 (searchRef.focus)

---

## 주의사항 (다음 에이전트용)

- RelatedSnippets 컴포넌트는 미구현 (시맨틱 검색 API 호출 부담)
- 사이드바 접기/펼치기 토글 UI 미구현 (AppContext에 sidebarCollapsed 상태는 존재)
- SettingsDialog 테스트 미작성 (4.1.4 체크리스트에 기록)
- `pnpm tauri dev`로 실제 UI 확인 권장
- 다음 단계: 4.3 크로스 플랫폼 빌드, 4.4 문서화
