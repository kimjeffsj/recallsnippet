# CLAUDE.md - RecallSnippet

## 프로젝트 한 줄 요약

개발자용 로컬 AI 기반 코드 스니펫 & 문제 해결 지식 베이스 (Tauri + Rust + React)

## 기술 스택

- **Frontend**: React 18 + TypeScript + Tailwind + shadcn/ui
- **Backend**: Tauri v2 + Rust
- **Database**: SQLite + sqlite-vec
- **AI**: Ollama (로컬 LLM)

## 프로젝트 구조

```
src/                  # React 프론트엔드
src-tauri/            # Rust 백엔드
./claude/skills/               # Claude Code 가이드 (아래 참조)
./claude/docs/PRD.md           # 제품 요구사항 문서
./claude/docs/CHECKLIST.md          # 개발 진행 체크리스트 ⭐
```

---

## ⚠️ 필수 규칙: 체크리스트 기반 진행

### 1. 체크리스트 확인 필수

- 작업 시작 전 `CHECKLIST.md`를 반드시 확인
- 현재 Phase의 미완료 항목부터 진행
- **체크되지 않은 항목이 있으면 다음 Phase로 절대 진행하지 않음**

### 2. 단계 완료 시 체크리스트 업데이트

- 각 항목 완료 시 `CHECKLIST.md`에서 해당 항목 체크 `[x]`
- Phase 완료 시 완료일과 회고 기록

### 3. 단계/Phase 완료 시 설명 제공

각 단계 또는 Phase 구현 완료 후, 반드시 아래 내용을 사용자에게 설명:

```
## 구현 설명

### 왜 이렇게 구성했는가?
- [코드 구조/패턴 선택 이유]

### 장점
- [이 접근법의 장점들]

### 단점 / 트레이드오프
- [이 접근법의 단점 또는 고려사항]

### 대안
- [다른 방식으로 구현할 수 있었던 옵션] (선택)
```

**예시:**

```
## 구현 설명: Snippet CRUD

### 왜 이렇게 구성했는가?
- Repository 패턴 대신 직접 SQL 쿼리 사용
- 프로젝트 규모가 작아 추상화 레이어 불필요

### 장점
- 코드가 단순하고 직관적
- 디버깅이 쉬움
- 성능 오버헤드 없음

### 단점 / 트레이드오프
- 테스트 시 실제 DB 필요 (모킹 어려움)
- 쿼리 로직이 여러 곳에 분산될 수 있음

### 대안
- SQLx + Repository 패턴 (더 큰 프로젝트에 적합)
```

---

## Skills 가이드 (작업 전 참조)

| 작업 영역  | 파일                               | 언제 읽을까                |
| ---------- | ---------------------------------- | -------------------------- |
| Tauri/Rust | `.claude/skills/tauri-rust.md`     | 백엔드, DB, 커맨드 작업 시 |
| React/TS   | `.claude/skills/react-frontend.md` | 프론트엔드 작업 시         |
| AI/RAG     | `.claude/skills/ai-pipeline.md`    | 검색, 임베딩, LLM 작업 시  |
| 테스트     | `.claude/skills/testing.md`        | 모든 기능 구현 전          |

## 핵심 명령어

```bash
pnpm tauri dev          # 개발 서버
pnpm test               # 프론트 테스트
cd src-tauri && cargo test  # Rust 테스트
pnpm tauri build        # 프로덕션 빌드
```

## 작업 원칙

1. **체크리스트 우선**: 작업 전 `CHECKLIST.md` 확인, 순서대로 진행
2. **TDD 필수**: 기능 구현 전 `skills/testing.md` 참조
3. **작은 단위**: 한 번에 하나의 기능만
4. **타입 안전**: 명시적 타입 정의
5. **로컬 only**: 외부 API 호출 금지
6. **설명 필수**: 단계 완료 시 구현 이유와 장단점 설명

## 현재 진행 상황

> `CHECKLIST.md` 참조

- [ ] Phase 1: 프로젝트 셋업
- [ ] Phase 2: CRUD 기능
- [ ] Phase 3: AI 통합
- [ ] Phase 4: 마무리

## 빠른 참조

- **체크리스트**: `CHECKLIST.md` ⭐
- PRD: `docs/PRD.md`
- DB 스키마: `skills/tauri-rust.md#database-schema`
- API 정의: `skills/tauri-rust.md#tauri-commands`
- 컴포넌트 구조: `skills/react-frontend.md#component-structure`
