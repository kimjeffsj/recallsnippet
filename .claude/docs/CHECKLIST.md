# RecallSnippet 개발 체크리스트

> ⚠️ **중요**: 각 Phase의 모든 항목이 체크되어야 다음 Phase로 진행할 수 있습니다.
> 체크되지 않은 항목이 있으면 해당 항목을 먼저 완료하세요.

---

## Phase 1: 프로젝트 셋업

### 1.1 환경 설정

- [x] Node.js 18+ 설치 확인 (v22.14.0)
- [x] Rust (rustup) 설치 확인 (1.93.0)
- [x] pnpm 설치 확인 (10.29.1)
- [x] Ollama 설치 및 실행 확인 (0.15.5, nomic-embed-text + qwen2.5-coder:7b)

### 1.2 프로젝트 초기화

- [x] Tauri + React + TypeScript 프로젝트 생성
- [x] 디렉토리 구조 설정 (src/, src-tauri/, ./claude/skills/, ./claude/docs/)
- [x] Tailwind CSS 설정
- [x] shadcn/ui 초기화

### 1.3 기본 설정

- [x] ESLint + Prettier 설정
- [x] Vitest 설정
- [x] Cargo.toml 의존성 추가 (rusqlite, tokio, reqwest, thiserror, anyhow, chrono)
- [x] tauri.conf.json 설정 (pnpm, 앱 이름 변경)

### 1.4 데이터베이스

- [x] SQLite 연결 구현 (Rust) - db/connection.rs
- [x] 마이그레이션 시스템 구현 - db/migrations.rs
- [x] 초기 스키마 생성 (snippets, tags, snippet_tags, embeddings)
- [x] DB 연결 테스트 작성 및 통과 (5개 테스트 통과)

### 1.5 Phase 1 완료 확인

- [x] `pnpm tauri dev` 실행 시 빈 앱 창 표시
- [x] `cargo test` 통과 (src-tauri 폴더에서 실행)
- [x] `pnpm test` 통과

**Phase 1 완료일**: 2026-02-07
**회고/메모**:

- npm → pnpm 전환 완료 (packageManager 필드, preinstall 스크립트)
- Rust 의존성: rusqlite(bundled), tokio, reqwest, thiserror, anyhow, chrono, dirs
- DB 마이그레이션 시스템 구현 완료 (5개 테스트)

---

## Phase 2: 핵심 CRUD

### 2.1 백엔드 - Snippet CRUD

- [x] CreateSnippetInput 구조체 정의
- [x] create_snippet 커맨드 구현
- [x] create_snippet 테스트 작성 및 통과
- [x] get_snippet 커맨드 구현
- [x] get_snippet 테스트 작성 및 통과
- [x] list_snippets 커맨드 구현
- [x] list_snippets 테스트 작성 및 통과
- [x] update_snippet 커맨드 구현
- [x] update_snippet 테스트 작성 및 통과
- [x] delete_snippet 커맨드 구현
- [x] delete_snippet 테스트 작성 및 통과

### 2.2 백엔드 - Tag CRUD

- [x] Tag 구조체 정의
- [x] list_tags 커맨드 구현
- [x] create_tag 커맨드 구현
- [x] snippet_tags 연결 로직 구현
- [x] Tag 관련 테스트 작성 및 통과

### 2.3 프론트엔드 - 타입 & API

- [x] lib/types.ts 타입 정의
- [x] lib/tauri.ts API 래퍼 구현
- [x] TanStack Query 설정
- [x] useSnippets 훅 구현
- [x] useSnippets 테스트 작성 및 통과

### 2.4 프론트엔드 - 컴포넌트

- [x] MainLayout 컴포넌트
- [x] SnippetCard 컴포넌트 + 테스트
- [x] SnippetList 컴포넌트 + 테스트
- [x] SnippetForm 컴포넌트 + 테스트
- [x] SnippetDetail 컴포넌트 + 테스트
- [x] CodeBlock (syntax highlighting) 컴포넌트

### 2.5 프론트엔드 - 페이지 통합

- [x] HomePage (목록 표시)
- [x] 새 스니펫 생성 플로우
- [x] 스니펫 수정 플로우
- [x] 스니펫 삭제 플로우

### 2.6 Phase 2 완료 확인

- [x] 스니펫 생성 → 목록에 표시
- [x] 스니펫 수정 → 변경 사항 반영
- [x] 스니펫 삭제 → 목록에서 제거
- [x] 태그 추가/표시 동작
- [x] 모든 테스트 통과

**Phase 2 완료일**: 2026-02-09
**회고/메모**:
- Snippet CRUD + Tag CRUD 백엔드 구현 (27개 Rust 테스트)
- 프론트엔드 타입, API 래퍼, TanStack Query 훅 구현
- 6개 컴포넌트 구현 (MainLayout, SnippetCard, SnippetList, SnippetForm, SnippetDetail, CodeBlock)
- HomePage 페이지 통합 (생성/수정/삭제/목록 플로우)
- 프론트엔드 42개 테스트 전체 통과
- zustand/react-router 없이 useState 기반 뷰 전환으로 단순화

---

## Phase 3: AI 통합

### 3.1 Ollama 연동

- [x] Ollama 연결 상태 확인 함수
- [x] list_ollama_models 커맨드 구현
- [x] Ollama 연결 실패 시 에러 처리

### 3.2 임베딩 파이프라인

- [x] 임베딩 생성 함수 구현 (Rust)
- [x] 임베딩 저장 로직 구현
- [x] 스니펫 저장 시 자동 임베딩 생성
- [x] 임베딩 테스트 작성 및 통과

### 3.3 시맨틱 검색

- [x] sqlite-vec 설정
- [x] semantic_search 커맨드 구현
- [x] 벡터 유사도 검색 로직
- [x] 검색 결과 정렬 (관련도 순)
- [x] 시맨틱 검색 테스트 작성 및 통과

### 3.4 AI 자동 완성

- [x] generate_solution 커맨드 구현
- [x] suggest_tags 커맨드 구현
- [x] 프롬프트 템플릿 최적화
- [x] AI 자동 완성 테스트

### 3.5 프론트엔드 - 검색 UI

- [x] SearchBar 컴포넌트 + 테스트
- [x] SearchResults 컴포넌트 + 테스트
- [x] useSemanticSearch 훅 구현
- [x] 검색 결과 표시 UI

### 3.6 프론트엔드 - AI 도움 UI

- [x] "AI 도움받기" 버튼 추가
- [x] 로딩 상태 표시
- [x] AI 생성 결과 폼에 채우기
- [x] 에러 처리 (Ollama 미실행 등)

### 3.7 Phase 3 완료 확인

- [x] 자연어 검색 → 관련 스니펫 표시
- [x] "AI 도움받기" → 해결책 자동 생성
- [x] 태그 자동 추천 동작
- [x] Ollama 미실행 시 적절한 안내
- [x] 모든 테스트 통과

**Phase 3 완료일**: 2026-02-09
**회고/메모**:
- Ollama 연결 확인 + 모델 목록 조회 (Phase 3.1)
- 임베딩 파이프라인: 생성/저장/자동임베딩 (Phase 3.2)
- 시맨틱 검색: 순수 Rust 코사인 유사도 (sqlite-vec 대신) (Phase 3.3)
- AI 자동 완성: generate_solution + suggest_tags (Phase 3.4)
- 검색 UI: SearchBar + SearchResults + useSemanticSearch (Phase 3.5)
- AI 도움 UI: SnippetForm에 AI Help/AI Tags 버튼 (Phase 3.6)
- Rust 49개 + 프론트 55개 = 총 104개 테스트 통과

---

## Phase 4: 마무리

### 4.1 설정 기능

- [ ] Settings 구조체 정의
- [ ] get_settings / update_settings 커맨드
- [ ] SettingsDialog 컴포넌트
- [ ] LLM 모델 선택 기능
- [ ] 테마 전환 (다크/라이트)
- [ ] 데이터 저장 경로 설정

### 4.2 UI 개선

- [ ] 반응형 레이아웃 확인
- [ ] 키보드 단축키 (선택)
- [ ] 로딩/에러 상태 UI 일관성
- [ ] 빈 상태 UI (스니펫 없을 때)

### 4.3 크로스 플랫폼 빌드

- [ ] macOS 빌드 테스트
- [ ] Windows 빌드 테스트
- [ ] 아이콘 설정

### 4.4 문서화

- [ ] README.md 작성
  - [ ] 프로젝트 소개
  - [ ] 기술 스택
  - [ ] 설치 방법
  - [ ] 스크린샷/GIF
- [ ] 아키텍처 다이어그램
- [ ] API 문서 (선택)

### 4.5 Phase 4 완료 확인

- [ ] 설정 변경 → 앱 재시작 없이 반영
- [ ] macOS/Windows 빌드 성공
- [ ] README로 다른 사람이 셋업 가능
- [ ] 모든 테스트 통과

**Phase 4 완료일**: **\*\***\_\_\_**\*\***
**회고/메모**:

---

## 🎉 프로젝트 완료 체크리스트

- [ ] 모든 Phase 완료
- [ ] GitHub 레포지토리 생성 및 푸시
- [ ] Release 빌드 생성
- [ ] 데모 영상/GIF 제작
- [ ] 포트폴리오에 추가

**프로젝트 완료일**: **\*\***\_\_\_**\*\***

---

## 진행 기록

| 날짜       | Phase | 완료 항목                        | 메모                                        |
| ---------- | ----- | -------------------------------- | ------------------------------------------- |
| 2026-02-06 | 1.2   | 프로젝트 생성, 디렉토리 구조     | Tauri v2 + React 19 + TS 기본 템플릿        |
| 2026-02-06 | 1.2   | Tailwind CSS v4 + shadcn/ui 설정 | @tailwindcss/vite 플러그인 방식             |
| 2026-02-07 | 1.1   | 환경 설정 확인                   | Node 22, Rust 1.93, pnpm 10.29, Ollama 0.15 |
| 2026-02-07 | 1.3   | ESLint, Prettier, Vitest 설정    | npm→pnpm 전환                               |
| 2026-02-07 | 1.4   | SQLite + 마이그레이션 구현       | db/connection.rs, db/migrations.rs          |
| 2026-02-07 | 1.5   | Phase 1 완료                     | 빈 앱 창 표시, 테스트 통과                  |
| 2026-02-07 | 2.1   | Snippet CRUD 백엔드 구현         | 5개 커맨드 + 14개 테스트 (총 19개 통과)      |
| 2026-02-07 | 2.2   | Tag CRUD 백엔드 구현             | 3개 커맨드 + 8개 테스트 (총 27개 통과)       |
| 2026-02-09 | 2.3   | 프론트엔드 타입 & API            | types, tauri API, hooks, 8개 훅 테스트 통과  |
| 2026-02-09 | 2.4   | 프론트엔드 컴포넌트              | 6개 컴포넌트 + 25개 테스트 (총 34개 통과)    |
| 2026-02-09 | 2.5   | 프론트엔드 페이지 통합           | HomePage + 8개 통합 테스트 (총 42개 통과)    |
| 2026-02-09 | 2.6   | Phase 2 완료                     | 전체 CRUD 플로우 동작 확인                   |
| 2026-02-09 | 3.1   | Ollama 연동                      | 연결 확인 + 모델 목록 + 3개 테스트 (총 30개) |
| 2026-02-09 | 3.2   | 임베딩 파이프라인                | 생성/저장/자동임베딩 + 7개 테스트 (총 37개)  |
| 2026-02-09 | 3.3   | 시맨틱 검색                      | 코사인 유사도 + 7개 테스트 (총 44개)         |
| 2026-02-09 | 3.4   | AI 자동 완성                     | 솔루션 생성 + 태그 추천 + 5개 테스트 (총 49개)|
| 2026-02-09 | 3.5   | 프론트엔드 검색 UI               | SearchBar + SearchResults + 13개 테스트 (총 55개)|
| 2026-02-09 | 3.6   | AI 도움 UI                       | AI Help/AI Tags 버튼 + useAI 훅              |
| 2026-02-09 | 3.7   | Phase 3 완료                     | 총 104개 테스트 통과 (Rust 49 + Front 55)    |
