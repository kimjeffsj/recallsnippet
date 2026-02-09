# Phase 3.5 - 프론트엔드 검색 UI

**날짜**: 2026-02-09
**Phase**: 3.5 (프론트엔드 - 검색 UI)
**범위**: SearchBar, SearchResults 컴포넌트, useSemanticSearch 훅, HomePage 통합

## 변경된 파일

- `src/components/search/SearchBar.tsx` (신규) - 검색 입력 + 클리어 버튼
- `src/components/search/SearchBar.test.tsx` (신규) - 6개 테스트
- `src/components/search/SearchResults.tsx` (신규) - 검색 결과 목록 + 유사도 점수
- `src/components/search/SearchResults.test.tsx` (신규) - 7개 테스트
- `src/hooks/useSearch.ts` (신규) - useSemanticSearch 훅 (useDeferredValue)
- `src/lib/types.ts` (수정) - SearchResult 타입 추가
- `src/lib/tauri.ts` (수정) - searchApi, aiApi 추가
- `src/pages/HomePage.tsx` (수정) - 검색 UI 통합

## 테스트 결과

- 프론트엔드 테스트: **55개 전체 통과** (기존 42개 + 신규 13개)

## 구현 설명

### 왜 이렇게 구성했는가?

- **사이드바에 SearchBar 배치**: 목록과 검색을 같은 뷰에서 전환하여 UX 간소화
- **useDeferredValue**: 검색어 디바운싱으로 타이핑 중 불필요한 API 호출 방지
- **3글자 이상 시 검색 시작**: 너무 짧은 쿼리로 의미 없는 결과 방지
- **Ollama 에러 시 안내 메시지**: `ollama serve` 실행 안내

### 장점

- 검색어 입력 즉시 결과 표시 (React 19 useDeferredValue)
- 유사도 점수(%) 표시로 결과 신뢰도 시각화
- Ollama 미실행 시 친절한 안내 UI

### 단점 / 트레이드오프

- 텍스트 검색과 시맨틱 검색 통합 미구현 (현재 시맨틱만)
- 검색 결과 캐시 1분 (staleTime) - 실시간성 vs 성능 트레이드오프
