# RecallSnippet 개발 체크리스트

> ⚠️ **중요**: 각 Phase의 모든 항목이 체크되어야 다음 Phase로 진행할 수 있습니다.
> 체크되지 않은 항목이 있으면 해당 항목을 먼저 완료하세요.

---

## Phase 1: 프로젝트 셋업

### 1.1 환경 설정

- [ ] Node.js 18+ 설치 확인
- [ ] Rust (rustup) 설치 확인
- [ ] pnpm 설치 확인
- [ ] Ollama 설치 및 실행 확인

### 1.2 프로젝트 초기화

- [x] Tauri + React + TypeScript 프로젝트 생성
- [x] 디렉토리 구조 설정 (src/, src-tauri/, ./claude/skills/, ./claude/docs/)
- [x] Tailwind CSS 설정
- [x] shadcn/ui 초기화

### 1.3 기본 설정

- [ ] ESLint + Prettier 설정
- [ ] Vitest 설정
- [ ] Cargo.toml 의존성 추가
- [ ] tauri.conf.json 설정

### 1.4 데이터베이스

- [ ] SQLite 연결 구현 (Rust)
- [ ] 마이그레이션 시스템 구현
- [ ] 초기 스키마 생성 (snippets, tags, snippet_tags, embeddings)
- [ ] DB 연결 테스트 작성 및 통과

### 1.5 Phase 1 완료 확인

- [ ] `pnpm tauri dev` 실행 시 빈 앱 창 표시
- [ ] `cargo test` 통과
- [ ] `pnpm test` 통과

**Phase 1 완료일**: **\*\***\_\_\_**\*\***
**회고/메모**:

---

## Phase 2: 핵심 CRUD

### 2.1 백엔드 - Snippet CRUD

- [ ] CreateSnippetInput 구조체 정의
- [ ] create_snippet 커맨드 구현
- [ ] create_snippet 테스트 작성 및 통과
- [ ] get_snippet 커맨드 구현
- [ ] get_snippet 테스트 작성 및 통과
- [ ] list_snippets 커맨드 구현
- [ ] list_snippets 테스트 작성 및 통과
- [ ] update_snippet 커맨드 구현
- [ ] update_snippet 테스트 작성 및 통과
- [ ] delete_snippet 커맨드 구현
- [ ] delete_snippet 테스트 작성 및 통과

### 2.2 백엔드 - Tag CRUD

- [ ] Tag 구조체 정의
- [ ] list_tags 커맨드 구현
- [ ] create_tag 커맨드 구현
- [ ] snippet_tags 연결 로직 구현
- [ ] Tag 관련 테스트 작성 및 통과

### 2.3 프론트엔드 - 타입 & API

- [ ] lib/types.ts 타입 정의
- [ ] lib/tauri.ts API 래퍼 구현
- [ ] TanStack Query 설정
- [ ] useSnippets 훅 구현
- [ ] useSnippets 테스트 작성 및 통과

### 2.4 프론트엔드 - 컴포넌트

- [ ] MainLayout 컴포넌트
- [ ] SnippetCard 컴포넌트 + 테스트
- [ ] SnippetList 컴포넌트 + 테스트
- [ ] SnippetForm 컴포넌트 + 테스트
- [ ] SnippetDetail 컴포넌트 + 테스트
- [ ] CodeBlock (syntax highlighting) 컴포넌트

### 2.5 프론트엔드 - 페이지 통합

- [ ] HomePage (목록 표시)
- [ ] 새 스니펫 생성 플로우
- [ ] 스니펫 수정 플로우
- [ ] 스니펫 삭제 플로우

### 2.6 Phase 2 완료 확인

- [ ] 스니펫 생성 → 목록에 표시
- [ ] 스니펫 수정 → 변경 사항 반영
- [ ] 스니펫 삭제 → 목록에서 제거
- [ ] 태그 추가/표시 동작
- [ ] 모든 테스트 통과

**Phase 2 완료일**: **\*\***\_\_\_**\*\***
**회고/메모**:

---

## Phase 3: AI 통합

### 3.1 Ollama 연동

- [ ] Ollama 연결 상태 확인 함수
- [ ] list_ollama_models 커맨드 구현
- [ ] Ollama 연결 실패 시 에러 처리

### 3.2 임베딩 파이프라인

- [ ] 임베딩 생성 함수 구현 (Rust)
- [ ] 임베딩 저장 로직 구현
- [ ] 스니펫 저장 시 자동 임베딩 생성
- [ ] 임베딩 테스트 작성 및 통과

### 3.3 시맨틱 검색

- [ ] sqlite-vec 설정
- [ ] semantic_search 커맨드 구현
- [ ] 벡터 유사도 검색 로직
- [ ] 검색 결과 정렬 (관련도 순)
- [ ] 시맨틱 검색 테스트 작성 및 통과

### 3.4 AI 자동 완성

- [ ] generate_solution 커맨드 구현
- [ ] suggest_tags 커맨드 구현
- [ ] 프롬프트 템플릿 최적화
- [ ] AI 자동 완성 테스트

### 3.5 프론트엔드 - 검색 UI

- [ ] SearchBar 컴포넌트 + 테스트
- [ ] SearchResults 컴포넌트 + 테스트
- [ ] useSemanticSearch 훅 구현
- [ ] 검색 결과 표시 UI

### 3.6 프론트엔드 - AI 도움 UI

- [ ] "AI 도움받기" 버튼 추가
- [ ] 로딩 상태 표시
- [ ] AI 생성 결과 폼에 채우기
- [ ] 에러 처리 (Ollama 미실행 등)

### 3.7 Phase 3 완료 확인

- [ ] 자연어 검색 → 관련 스니펫 표시
- [ ] "AI 도움받기" → 해결책 자동 생성
- [ ] 태그 자동 추천 동작
- [ ] Ollama 미실행 시 적절한 안내
- [ ] 모든 테스트 통과

**Phase 3 완료일**: **\*\***\_\_\_**\*\***
**회고/메모**:

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

| 날짜 | Phase | 완료 항목 | 메모 |
| ---- | ----- | --------- | ---- |
| 2026-02-06 | 1.2 | 프로젝트 생성, 디렉토리 구조 | Tauri v2 + React 19 + TS 기본 템플릿 |
| 2026-02-06 | 1.2 | Tailwind CSS v4 + shadcn/ui 설정 | @tailwindcss/vite 플러그인 방식 |
|      |       |           |      |
|      |       |           |      |
