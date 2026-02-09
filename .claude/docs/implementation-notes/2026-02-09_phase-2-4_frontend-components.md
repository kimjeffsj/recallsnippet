# Phase 2.4: 프론트엔드 - 컴포넌트

**날짜**: 2026-02-09
**Phase**: 2.4
**범위**: UI 컴포넌트 구현 (MainLayout, SnippetCard, SnippetList, SnippetForm, SnippetDetail, CodeBlock)

---

## 변경된 파일

| 파일 | 작업 |
|------|------|
| `src/components/layout/MainLayout.tsx` | 신규 - sidebar + main 레이아웃 |
| `src/components/snippet/SnippetCard.tsx` | 신규 - 스니펫 카드 (목록용) |
| `src/components/snippet/SnippetCard.test.tsx` | 신규 - 6개 테스트 |
| `src/components/snippet/SnippetList.tsx` | 신규 - 스니펫 목록 (로딩/빈 상태 포함) |
| `src/components/snippet/SnippetList.test.tsx` | 신규 - 5개 테스트 |
| `src/components/snippet/SnippetForm.tsx` | 신규 - 생성/수정 폼 (태그 선택 포함) |
| `src/components/snippet/SnippetForm.test.tsx` | 신규 - 7개 테스트 |
| `src/components/snippet/SnippetDetail.tsx` | 신규 - 상세 보기 (코드/참조 URL 포함) |
| `src/components/snippet/SnippetDetail.test.tsx` | 신규 - 7개 테스트 |
| `src/components/snippet/CodeBlock.tsx` | 신규 - syntax highlighting |
| `src/components/ui/*.tsx` | shadcn/ui 12개 컴포넌트 설치 |

## 테스트 결과

- 프론트엔드: 34개 통과 (기존 9개 + 신규 25개)

---

## 구현 설명

### 왜 이렇게 구성했는가?

- **MainLayout**: sidebar + main 2패널 구조. sidebar는 optional prop으로 받아서 태그 필터/검색 UI를 나중에 유연하게 배치 가능
- **SnippetCard**: `<button>` 기반으로 접근성 확보 (키보드 네비게이션). Badge로 언어/태그 시각화
- **SnippetList**: 로딩/빈 상태를 컴포넌트 레벨에서 처리 (페이지가 아닌 컴포넌트에서 상태 관리)
- **SnippetForm**: controlled input으로 제어. 태그는 토글 방식으로 선택. `CreateSnippetInput` 타입을 직접 출력
- **SnippetDetail**: 읽기 전용 뷰. Edit/Delete 액션을 콜백으로 위임 (컴포넌트는 표시만 담당)
- **CodeBlock**: react-syntax-highlighter + atomOneDark 테마. 간결한 래퍼

### 장점

- 모든 컴포넌트가 순수한 presentational (상태/API 호출 없음) → 테스트가 단순하고 빠름
- shadcn/ui 컴포넌트 활용으로 일관된 디자인 시스템
- SnippetForm이 create/edit 모두 처리 (snippet prop 유무로 구분)
- 접근성: aria-label, semantic HTML, 키보드 지원

### 단점 / 트레이드오프

- CodeBlock이 hljs 번들을 포함 → 빌드 사이즈 증가. lazy import로 개선 가능하지만 현재 규모에서는 불필요
- SnippetForm의 태그 선택이 단순 토글 → 태그가 많아지면 검색/필터 필요
- SnippetDetail에서 Markdown 렌더링 미구현 (problem/solution이 현재 plain text)

### 대안

- **react-hook-form**: SnippetForm에 적용 가능하나 필드 수가 적어 useState로 충분
- **Markdown 렌더링**: react-markdown으로 solution/problem 렌더링 가능 (Phase 4에서 고려)
- **Virtual list**: 대량 스니펫 시 react-virtual 필요하지만 로컬 앱에서는 불필요
