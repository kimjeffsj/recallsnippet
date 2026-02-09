# Phase 2.5 - 프론트엔드 페이지 통합

**날짜**: 2026-02-09
**Phase**: 2.5 (프론트엔드 - 페이지 통합)
**범위**: HomePage 통합, CRUD 플로우 연결

## 변경된 파일

- `src/pages/HomePage.tsx` (신규) - 메인 페이지, 전체 CRUD 플로우 통합
- `src/pages/HomePage.test.tsx` (신규) - 8개 통합 테스트
- `src/App.tsx` (수정) - 기존 데모 코드 제거, HomePage 렌더링

## 테스트 결과

- 프론트엔드 테스트: **42개 전체 통과**
  - HomePage: 8개 (목록, 생성, 수정, 삭제, 빈 상태 등)
  - 기존 컴포넌트/훅 테스트: 34개

## 구현 설명

### 왜 이렇게 구성했는가?

- **useState 기반 뷰 전환**: `View` 타입 (`list | create | edit | detail`)으로 4가지 상태 관리
- **단일 페이지 구조**: Tauri 앱은 SPA이므로 react-router 없이 상태 기반 뷰 전환이 더 단순함
- **zustand 미사용**: 현재 단계에서 전역 상태가 불필요. HomePage 내 로컬 상태로 충분

### 장점

- 추가 의존성 없이 구현 (react-router, zustand 불필요)
- 기존 컴포넌트(SnippetList, SnippetDetail, SnippetForm)를 그대로 활용
- TanStack Query의 캐시 무효화로 생성/수정/삭제 후 자동 목록 갱신
- 사이드바에 언어 필터 + 태그 표시 제공

### 단점 / 트레이드오프

- 뷰 전환이 복잡해지면 react-router나 zustand 도입 필요
- 브라우저 히스토리(뒤로가기) 미지원 - Tauri 앱에서는 큰 문제 아님
- `window.confirm` 사용 (삭제 확인) - 추후 커스텀 Dialog로 교체 가능

### 대안

- react-router-dom으로 URL 기반 라우팅 가능했으나 오버엔지니어링
- zustand로 전역 상태 관리 가능했으나 현 단계에서는 불필요
