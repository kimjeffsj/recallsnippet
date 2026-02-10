# SpotlightChat 개선: 블러 수정 + 스니펫 카드 UI

**날짜**: 2026-02-10
**범위**: Dialog 렌더링 수정, SpotlightChat UX 전환, 코드 정리

---

## 변경된 파일

1. `src/components/ui/dialog.tsx` — flexbox 중앙 정렬로 변경
2. `src/components/ai/SpotlightChat.tsx` — AI 채팅 → 시맨틱 검색 카드 UI
3. `src/components/ai/SpotlightChat.test.tsx` — 테스트 업데이트 (6개)
4. `src/pages/HomePage.tsx` — SpotlightChat props 변경, spotlightContext 제거
5. `src/components/snippet/SnippetDetail.tsx` — onAskAI → onFindRelated, UI 텍스트 변경
6. `src/hooks/useAI.ts` — useAIChat 훅 제거
7. `src/lib/tauri.ts` — aiApi.chat 제거

## 테스트 결과

- Frontend: 83개 통과 (변경 없음)
- Rust: 55개 통과 (변경 없음)
- 총 138개 통과

## 구현 설명

### 왜 이렇게 구성했는가?

**Dialog 블러 수정**: `translate-x-[-50%] translate-y-[-50%]` 방식은 서브픽셀 렌더링 문제로 텍스트가 흐릿하게 보일 수 있음. DialogOverlay를 `flex items-center justify-center` 컨테이너로 변경하고 DialogContent를 자식으로 배치하면 정수 픽셀에 정렬됨.

**스니펫 카드 UI 전환**: AI 텍스트 답변은 코드가 포함될 때 가독성이 떨어짐. 대신 시맨틱 검색 결과를 카드로 보여주고 클릭하면 해당 스니펫으로 이동하는 방식이 더 직관적이고 유용함.

### 장점

- 서브픽셀 블러 문제 완전 해결
- LLM 응답 대기 없이 즉시 검색 결과 제공 (더 빠름)
- 검색 결과 카드가 기존 앱 패턴과 일관됨
- 카드 클릭으로 바로 스니펫 이동 (더 나은 UX)
- 불필요한 useAIChat/aiApi.chat 코드 제거로 번들 축소

### 단점 / 트레이드오프

- AI 대화형 인터렉션 제거 (향후 필요시 백엔드 ai_chat 커맨드 재활용 가능)
- Ollama 미실행 시 검색 실패 시 빈 결과만 표시 (에러 메시지 개선 여지)

### 아키텍처 결정

- 백엔드 `ai_chat` 커맨드는 유지 (향후 활용 가능)
- `searchApi.semantic` 직접 호출로 TanStack Query 없이 간단하게 구현 (디바운스 300ms)
- DialogOverlay가 Content의 부모가 되도록 구조 변경 (Radix 호환 유지)
