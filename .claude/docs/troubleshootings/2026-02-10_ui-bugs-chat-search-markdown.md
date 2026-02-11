# UI 버그 수정: 채팅 오버플로우, 서치 드롭다운, 마크다운 렌더링

**날짜**: 2026-02-10

---

## 1. SpotlightChat 콘텐츠 오버플로우

**증상**: AI 응답이 길면 다이얼로그 밖으로 넘침, 스크롤 없음

**원인**: Radix `ScrollArea`의 Viewport가 flex 컨테이너 내에서 높이 계산 실패. `DialogContent`에 `overflow-hidden` 없음.

**해결**:
```tsx
// ScrollArea → 네이티브 overflow-y-auto 교체
<DialogContent className="... overflow-hidden">
  <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
    <div className="p-4 space-y-4">{/* messages */}</div>
  </div>
</DialogContent>
```

메시지 버블에도 overflow 제어 추가:
```tsx
<div className="max-w-[85%] rounded-xl px-4 py-3 overflow-hidden min-w-0 break-words">
```

**교훈**: Radix ScrollArea는 flex 레이아웃에서 높이 제약이 깨질 수 있음. 네이티브 `overflow-y-auto` + `min-h-0`이 더 안정적.

---

## 2. 서치바 → 드롭다운 전환

**증상**: 스니펫 상세/생성/편집 뷰에서 검색이 작동하지 않음

**원인**: `useSemanticSearch`가 `HomePage`에만 있고, 검색 결과는 `default` case에서만 렌더링됨.

**해결**: 검색 로직을 `AppHeader`로 이동, 결과를 absolute 드롭다운으로 표시.

```tsx
// AppHeader.tsx
const { data: searchResults, isLoading, isError } = useSemanticSearch(searchQuery);

<div className="flex-1 max-w-2xl px-4 relative">
  <Input ... />
  {isSearching && (
    <SearchDropdown
      results={searchResults}
      onSelect={handleSelect}  // query 초기화 + 스니펫 이동
      onClose={handleCloseDropdown}
    />
  )}
</div>
```

```tsx
// SearchDropdown.tsx - 외부 클릭 닫기
useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
      onClose();
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, [onClose]);
```

---

## 3. 마크다운 렌더링 깨짐

**증상**: 인라인 코드가 코드블록으로 처리됨, 인라인 코드 배경이 버블과 구분 안 됨

**해결**:
```tsx
// 인라인 코드 감지: \n 포함 여부로 판단 (기존: !match && !className)
const hasNewline = String(children).includes("\n");
const isInline = !match && !className && !hasNewline;

// 인라인 코드 배경: bg-muted → bg-black/20 (버블과 구분)
<code className="px-1.5 py-0.5 rounded text-xs bg-black/20 font-mono">

// 코드펜스 앞뒤 빈줄 보장
function normalizeMarkdown(content: string): string {
  return content
    .replace(/([^\n])\n(```)/g, "$1\n\n$2")
    .replace(/(```[^\n]*\n[\s\S]*?```)\n([^\n])/g, "$1\n\n$2");
}
```

SyntaxHighlighter에 `overflowX: 'auto'`, `<pre>` wrapper에 `overflow-x-auto max-w-full` 추가.

---

## 4. 언어 카테고리 중복 (TS가 2개)

**증상**: 사이드바에 같은 언어가 대소문자 차이로 중복 표시

**원인**: `codeLanguage`가 정규화 없이 그대로 저장됨. `Set` 중복 제거가 대소문자 구분.

**해결**:
```tsx
// 저장 시 소문자 정규화 (SnippetForm.tsx)
codeLanguage: codeLanguage.trim().toLowerCase() || undefined,

// 사이드바 중복 제거 시 소문자 변환 (AppSidebar.tsx)
const languages = [
  ...new Set(snippets.map((s) => s.codeLanguage?.toLowerCase()).filter(Boolean) as string[]),
];

// 배지 표시 시 capitalize (SnippetDetail.tsx)
<span className="... capitalize">{snippet.codeLanguage}</span>
```

```rust
// SQL 필터 case-insensitive (snippet.rs)
sql.push_str(" AND LOWER(code_language) = LOWER(?)");
```
