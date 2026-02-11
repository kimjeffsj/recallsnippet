# Phase 4.2.10: AI Section & Provider UI

**날짜**: 2026-02-10
**Phase**: 4.2.10
**범위**: 사이드바 AI 섹션 재구성 + Settings Cloud Provider UI skeleton

---

## 변경된 파일

| 파일 | 변경 |
|------|------|
| `src/components/layout/AppSidebar.tsx` | Footer → 3행 AI Section (상태/모델카드/⌘J 힌트) |
| `src/components/layout/AppSidebar.test.tsx` | 3개 신규 테스트 (모델카드 클릭, Ask AI 힌트, configure 텍스트) |
| `src/components/settings/SettingsDialog.tsx` | Provider 선택 UI skeleton + Badge import |
| `.claude/docs/CHECKLIST.md` | 4.2.10 항목 추가 + 진행 기록 |

---

## 테스트 결과

- **Frontend**: 97 tests passed (기존 94 + 신규 3)
- **Rust**: 55 tests (변경 없음)
- **Total**: 152 tests

---

## 구현 설명

### 왜 이렇게 구성했는가?
- 사이드바 하단을 단순 상태 표시에서 "AI 섹션"으로 재구성하여 AI 기능 발견성(discoverability) 향상
- 모델명 카드를 클릭 가능하게 만들어 Settings로 바로 접근 가능
- ⌘J 힌트를 항상 보이게 하여 AI Chat 단축키 인지도 향상
- Cloud Provider UI는 `disabled` Select + Coming Soon Badge로 향후 확장 준비

### 장점
- AI 기능 3가지 진입점 통합 (상태 확인, 모델 설정, AI Chat)
- 기존 `SET_SETTINGS_OPEN` dispatch 재활용으로 코드 추가 최소화
- Provider UI가 disabled 상태로 존재하여 기능 예고 역할

### 단점 / 트레이드오프
- Provider Select가 disabled라 실제 동작하지 않음 (의도적)
- API Key 필드가 `{false && ...}`로 숨겨져 있어 dead code처럼 보일 수 있음

### 대안
- Provider UI를 별도 탭으로 분리할 수도 있었으나, 현재 설정 항목이 적어 인라인이 적절
