# Phase 2.3: 프론트엔드 - 타입 & API

**날짜**: 2026-02-09
**Phase**: 2.3
**범위**: TypeScript 타입 정의, Tauri API 래퍼, TanStack Query 훅

---

## 변경된 파일

| 파일 | 작업 |
|------|------|
| `src-tauri/src/models/snippet.rs` | `#[serde(rename_all = "camelCase")]` 추가 (모든 구조체) |
| `package.json` | `@tanstack/react-query` 의존성 추가 |
| `vitest.config.ts` | `@` path alias 추가 |
| `src/main.tsx` | `QueryClientProvider` 래핑 |
| `src/lib/types.ts` | 신규 - Snippet, Tag 등 타입 정의 |
| `src/lib/tauri.ts` | 신규 - snippetApi, tagApi invoke 래퍼 |
| `src/hooks/useSnippets.ts` | 신규 - useSnippets, useSnippet, useCreate/Update/Delete |
| `src/hooks/useTags.ts` | 신규 - useTags, useCreateTag, useDeleteTag |
| `src/hooks/useSnippets.test.tsx` | 신규 - 8개 테스트 |

## 테스트 결과

- 프론트엔드: 9개 통과 (기존 1개 + 신규 8개)
- 백엔드: 27개 통과 (변경 없음)

---

## 구현 설명

### 왜 이렇게 구성했는가?

- **serde rename_all**: Rust는 snake_case, JS는 camelCase가 관례. `#[serde(rename_all = "camelCase")]`를 Rust 모델에 추가하여 프론트엔드에서 `codeLanguage`, `tagIds` 등 자연스러운 JS 네이밍 사용
- **API 래퍼 분리**: `lib/tauri.ts`에 `snippetApi`, `tagApi` 객체로 분리하여 커맨드명을 한 곳에서 관리. 타입 안전한 invoke 호출
- **TanStack Query**: 서버 상태 관리에 특화된 라이브러리. 캐싱, 자동 리페치, 뮤테이션 후 invalidation 등을 선언적으로 처리
- **훅 분리**: `useSnippets`(목록), `useSnippet`(단건), `useCreate/Update/DeleteSnippet`(뮤테이션)으로 관심사 분리

### 장점

- 타입이 Rust 모델과 1:1 매핑되어 불일치 가능성 최소화
- TanStack Query의 캐시 invalidation으로 CRUD 후 UI 자동 갱신
- 모든 훅이 독립적이라 필요한 것만 import 가능
- 테스트에서 `@tauri-apps/api/core`만 모킹하면 전체 API 레이어 테스트 가능

### 단점 / 트레이드오프

- `staleTime: 60초` 설정 → 빈번한 변경 시 지연 가능 (mutation invalidation으로 보완)
- Tauri invoke는 이미 타입 안전하지 않음 (런타임에 JSON 변환) → 타입 불일치 시 런타임 에러
- `useTags` 훅은 테스트 미작성 (useSnippets와 동일한 패턴이므로 생략)

### 대안

- **Zustand**: 클라이언트 상태 관리용으로 나중에 추가 가능 (현재는 불필요)
- **tRPC 스타일 타입 공유**: Tauri 플러그인으로 가능하지만 과도한 설정 필요
- **SWR**: TanStack Query 대안이지만, mutation 지원이 약함
