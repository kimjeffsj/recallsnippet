# React + TypeScript 프론트엔드 가이드

## 개요
Tauri 앱의 프론트엔드. React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui 사용.

## 초기 설정 (Tailwind CSS v4 + shadcn/ui)

### 1. Tailwind CSS v4 설치
```bash
pnpm add tailwindcss @tailwindcss/vite
```

### 2. vite.config.ts 설정
```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 3. TypeScript 경로 설정

**tsconfig.json**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**tsconfig.app.json** (동일하게 추가)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 4. CSS 파일 설정 (src/index.css)
```css
@import "tailwindcss";
```

> ⚠️ Tailwind v4에서는 `tailwind.config.js` 불필요. 자동 content 감지.

### 5. shadcn/ui 초기화
```bash
pnpm add -D @types/node
pnpm dlx shadcn@latest init
```

### 6. 컴포넌트 추가 예시
```bash
pnpm dlx shadcn@latest add button input dialog card
```

## 디렉토리 구조
```
src/
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트 (자동 생성)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx     # 태그 필터 사이드바
│   │   ├── Header.tsx      # 검색바 + 액션 버튼
│   │   └── MainLayout.tsx  # 전체 레이아웃
│   ├── snippet/
│   │   ├── SnippetCard.tsx     # 목록용 카드
│   │   ├── SnippetDetail.tsx   # 상세 보기
│   │   ├── SnippetForm.tsx     # 생성/수정 폼
│   │   ├── SnippetList.tsx     # 스니펫 목록
│   │   └── CodeBlock.tsx       # 코드 하이라이팅
│   ├── search/
│   │   ├── SearchBar.tsx       # 검색 입력
│   │   └── SearchResults.tsx   # 검색 결과
│   └── settings/
│       └── SettingsDialog.tsx  # 설정 모달
├── hooks/
│   ├── useSnippets.ts      # 스니펫 CRUD 훅
│   ├── useSearch.ts        # 검색 훅
│   ├── useTags.ts          # 태그 훅
│   └── useSettings.ts      # 설정 훅
├── lib/
│   ├── tauri.ts            # Tauri invoke 래퍼
│   ├── types.ts            # 공통 타입 정의
│   └── utils.ts            # 유틸리티 함수
├── pages/
│   ├── HomePage.tsx        # 메인 (목록 + 검색)
│   └── SnippetPage.tsx     # 스니펫 상세/편집
├── App.tsx
├── main.tsx
└── index.css               # Tailwind v4: @import "tailwindcss"
```

## Component Structure

### 컴포넌트 템플릿
```tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ComponentNameProps {
  prop1: string
  prop2?: number
  onAction?: () => void
}

export function ComponentName({ 
  prop1, 
  prop2 = 0,
  onAction 
}: ComponentNameProps) {
  const [state, setState] = useState<StateType>(initialValue)

  const handleClick = () => {
    // 로직
    onAction?.()
  }

  return (
    <div className={cn("base-classes", conditionalClass && "conditional")}>
      {/* 내용 */}
    </div>
  )
}
```

### 주요 컴포넌트 정의

#### SnippetCard
```tsx
interface SnippetCardProps {
  snippet: SnippetSummary
  onClick: (id: string) => void
  isSelected?: boolean
}
```

#### SnippetForm
```tsx
interface SnippetFormProps {
  snippet?: Snippet          // 수정 시 기존 데이터
  onSubmit: (data: SnippetInput) => void
  onCancel: () => void
  isLoading?: boolean
}
```

#### SearchBar
```tsx
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
}
```

## 타입 정의 (lib/types.ts)

```typescript
// 스니펫
export interface Snippet {
  id: string
  title: string
  problem: string
  solution: string | null
  code: string | null
  codeLanguage: string | null
  referenceUrl: string | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface SnippetSummary {
  id: string
  title: string
  tags: Tag[]
  createdAt: string
}

export interface CreateSnippetInput {
  title: string
  problem: string
  solution?: string
  code?: string
  codeLanguage?: string
  referenceUrl?: string
  tagIds: string[]
}

export interface UpdateSnippetInput extends Partial<CreateSnippetInput> {}

// 태그
export interface Tag {
  id: string
  name: string
}

// 검색
export interface SearchResult {
  snippet: SnippetSummary
  score: number  // 유사도 점수
}

export interface SnippetFilter {
  tagIds?: string[]
  searchQuery?: string
  limit?: number
  offset?: number
}

// 설정
export interface Settings {
  ollamaModel: string
  theme: 'light' | 'dark' | 'system'
  dataPath: string
}
```

## Tauri 연동 (lib/tauri.ts)

```typescript
import { invoke } from '@tauri-apps/api/core'
import type { Snippet, SnippetSummary, CreateSnippetInput, ... } from './types'

// 스니펫 CRUD
export const snippetApi = {
  create: (input: CreateSnippetInput) => 
    invoke<Snippet>('create_snippet', { input }),
  
  get: (id: string) => 
    invoke<Snippet>('get_snippet', { id }),
  
  list: (filter?: SnippetFilter) => 
    invoke<SnippetSummary[]>('list_snippets', { filter }),
  
  update: (id: string, input: UpdateSnippetInput) => 
    invoke<Snippet>('update_snippet', { id, input }),
  
  delete: (id: string) => 
    invoke<void>('delete_snippet', { id }),
}

// 검색
export const searchApi = {
  semantic: (query: string, limit?: number) =>
    invoke<SearchResult[]>('semantic_search', { query, limit }),
  
  byTags: (tags: string[]) =>
    invoke<SnippetSummary[]>('search_by_tags', { tags }),
}

// AI
export const aiApi = {
  generateSolution: (problem: string) =>
    invoke<string>('generate_solution', { problem }),
  
  suggestTags: (content: string) =>
    invoke<string[]>('suggest_tags', { content }),
}

// 태그
export const tagApi = {
  list: () => invoke<Tag[]>('list_tags'),
  create: (name: string) => invoke<Tag>('create_tag', { name }),
}

// 설정
export const settingsApi = {
  get: () => invoke<Settings>('get_settings'),
  update: (settings: Settings) => invoke<void>('update_settings', { settings }),
  listModels: () => invoke<string[]>('list_ollama_models'),
}
```

## 커스텀 훅 패턴

### useSnippets.ts
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { snippetApi } from '@/lib/tauri'

export function useSnippets(filter?: SnippetFilter) {
  return useQuery({
    queryKey: ['snippets', filter],
    queryFn: () => snippetApi.list(filter),
  })
}

export function useSnippet(id: string) {
  return useQuery({
    queryKey: ['snippet', id],
    queryFn: () => snippetApi.get(id),
    enabled: !!id,
  })
}

export function useCreateSnippet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: snippetApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
    },
  })
}

export function useUpdateSnippet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSnippetInput }) =>
      snippetApi.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
      queryClient.invalidateQueries({ queryKey: ['snippet', id] })
    },
  })
}

export function useDeleteSnippet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: snippetApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
    },
  })
}
```

## 상태 관리

### TanStack Query (서버 상태)
- 스니펫 목록/상세
- 태그 목록
- 검색 결과
- 설정

### Zustand (클라이언트 상태)
```typescript
import { create } from 'zustand'

interface AppState {
  // 선택 상태
  selectedSnippetId: string | null
  setSelectedSnippetId: (id: string | null) => void
  
  // 필터 상태
  selectedTagIds: string[]
  toggleTag: (tagId: string) => void
  clearTags: () => void
  
  // UI 상태
  isFormOpen: boolean
  setFormOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedSnippetId: null,
  setSelectedSnippetId: (id) => set({ selectedSnippetId: id }),
  
  selectedTagIds: [],
  toggleTag: (tagId) => set((state) => ({
    selectedTagIds: state.selectedTagIds.includes(tagId)
      ? state.selectedTagIds.filter(id => id !== tagId)
      : [...state.selectedTagIds, tagId]
  })),
  clearTags: () => set({ selectedTagIds: [] }),
  
  isFormOpen: false,
  setFormOpen: (open) => set({ isFormOpen: open }),
}))
```

## 코딩 컨벤션

### 네이밍
- 컴포넌트: `PascalCase` (예: `SnippetCard`)
- 훅: `camelCase`, `use` 접두사 (예: `useSnippets`)
- 유틸리티: `camelCase` (예: `formatDate`)
- 타입/인터페이스: `PascalCase` (예: `SnippetInput`)
- 상수: `SCREAMING_SNAKE_CASE` (예: `DEFAULT_LIMIT`)

### 파일 구조
- 컴포넌트당 하나의 파일
- 관련 컴포넌트는 같은 폴더에
- index.ts로 re-export 하지 않음 (명시적 import 선호)

### Import 순서
```tsx
// 1. React
import { useState, useEffect } from 'react'

// 2. 외부 라이브러리
import { useQuery } from '@tanstack/react-query'

// 3. 내부 컴포넌트
import { Button } from '@/components/ui/button'
import { SnippetCard } from '@/components/snippet/SnippetCard'

// 4. 훅
import { useSnippets } from '@/hooks/useSnippets'

// 5. 유틸리티/타입
import { cn } from '@/lib/utils'
import type { Snippet } from '@/lib/types'
```

### 조건부 렌더링
```tsx
// 좋음: early return
if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />

return <Content data={data} />

// 좋음: 간단한 조건
{isVisible && <Component />}

// 피하기: 복잡한 삼항
{condition ? <A /> : condition2 ? <B /> : <C />}  // ❌
```

## 주요 Dependencies

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-opener": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "react-router-dom": "^7.0.0",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "~5.8.0",
    "vite": "^7.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.1.0",
    "@tailwindcss/vite": "^4.1.0",
    "@types/node": "^22.0.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```
