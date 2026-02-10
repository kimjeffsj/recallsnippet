# Plan v1.0.1 - 코드 에디터 + 그레이톤 테마 + Ollama 가이드

## Context
Phase 4.2 UI 리디자인 완료 후 추가 UX 개선. 코드 입력을 실제 에디터처럼, 다크모드를 뉴트럴 그레이로, Ollama 연동 가이드 문서화.

---

## Step 1: 다크모드 그레이톤 테마 수정

### 변경 파일
- `src/index.css` (`.dark` CSS 변수 전체 교체)
- `src/components/layout/AppHeader.tsx` (로고 그라데이션 뉴트럴)
- `src/components/snippet/SnippetDetail.tsx` (AI 바 뉴트럴)
- `src/index.css` 스크롤바 색상

### 새 `.dark` 팔레트 (뉴트럴 그레이, 블루 완전 제거)
```css
.dark {
  --background: #0a0a0a;
  --foreground: #e5e5e5;
  --card: #141414;
  --card-foreground: #e5e5e5;
  --popover: #141414;
  --popover-foreground: #e5e5e5;
  --primary: #e5e5e5;
  --primary-foreground: #0a0a0a;
  --secondary: #1c1c1c;
  --secondary-foreground: #e5e5e5;
  --muted: #1c1c1c;
  --muted-foreground: #a3a3a3;
  --accent: #1c1c1c;
  --accent-foreground: #e5e5e5;
  --destructive: #ef4444;
  --border: #262626;
  --input: #262626;
  --ring: #a3a3a3;
  --chart-1: #e5e5e5;
  --chart-2: #a3a3a3;
  --chart-3: #737373;
  --chart-4: #525252;
  --chart-5: #404040;
  --sidebar: #0f0f0f;
  --sidebar-foreground: #e5e5e5;
  --sidebar-primary: #e5e5e5;
  --sidebar-primary-foreground: #0a0a0a;
  --sidebar-accent: #1c1c1c;
  --sidebar-accent-foreground: #e5e5e5;
  --sidebar-border: #262626;
  --sidebar-ring: #a3a3a3;
}
```

---

## Step 2: CodeMirror 6 코드 에디터

### 설치 패키지
- `codemirror` (basic-setup)
- `@codemirror/view`, `@codemirror/state`, `@codemirror/commands`
- `@codemirror/lang-javascript`, `@codemirror/lang-python`, `@codemirror/lang-rust`
- `@codemirror/lang-html`, `@codemirror/lang-css`, `@codemirror/lang-json`
- `@codemirror/theme-one-dark`

### 새 파일: `src/components/editor/CodeEditor.tsx`
- CodeMirror 6 래퍼 React 컴포넌트
- Props: `value`, `onChange`, `language?`, `readOnly?`, `placeholder?`
- Compartment 기반 동적 언어/테마/readOnly 전환
- `useTheme` 훅으로 다크/라이트 테마 감지

### 수정: `src/components/snippet/SnippetForm.tsx`
- code 필드의 `<Textarea>` → `<CodeEditor>` 교체

---

## Step 3: 테스트
- `CodeEditor.test.tsx` 신규 (3 tests)
- `SnippetForm.test.tsx` CodeEditor 모킹
- 전체 77 tests 통과

---

## Step 4: Ollama 가이드 문서
- `.claude/docs/ollama-guide.md`
- 설치, 모델, 연동, 트러블슈팅

---

## Step 5: 이 문서 저장
- `.claude/docs/plan-1.0.1.md`
