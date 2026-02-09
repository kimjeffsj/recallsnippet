# Phase 3.6 - AI 도움 UI

**날짜**: 2026-02-09
**Phase**: 3.6 (프론트엔드 - AI 도움 UI)
**범위**: SnippetForm에 AI 솔루션 생성/태그 추천 버튼, useAI 훅

## 변경된 파일

- `src/hooks/useAI.ts` (신규) - useOllamaStatus, useGenerateSolution, useSuggestTags
- `src/components/snippet/SnippetForm.tsx` (수정) - AI Help/AI Tags 버튼, 에러 표시
- `src/components/snippet/SnippetForm.test.tsx` (수정) - QueryClientProvider 래퍼 추가
- `src/pages/HomePage.test.tsx` (수정) - check_ollama_connection mock 추가

## 테스트 결과

- 프론트엔드 테스트: **55개 전체 통과** (warning 없음)

## 구현 설명

### 왜 이렇게 구성했는가?

- **조건부 AI 버튼**: `useOllamaStatus`로 Ollama 연결 상태 확인 후 버튼 표시/숨김
- **Sparkles 아이콘**: AI 기능임을 직관적으로 표시
- **Loader2 animate-spin**: 생성 중 시각적 피드백
- **에러 alert**: AI 실패 시 폼 상단에 에러 메시지 표시

### 장점

- Ollama 미실행 시 AI 버튼이 숨겨져 혼란 방지
- 솔루션 생성 결과가 textarea에 자동 채워지며 수정 가능
- 태그 추천 시 기존 availableTags와 매칭하여 자동 선택

### 단점 / 트레이드오프

- AI 생성 중 폼 전체가 아닌 해당 버튼만 비활성화 (다른 필드는 편집 가능)
- 추천된 태그가 availableTags에 없으면 무시됨 (자동 태그 생성 미구현)
- 스트리밍 미지원으로 긴 생성 시 대기 필요
