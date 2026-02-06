# 테스팅 가이드 (TDD)

## 원칙

### TDD 사이클
```
1. Red   → 실패하는 테스트 작성
2. Green → 테스트 통과하는 최소한의 코드 작성
3. Refactor → 코드 개선 (테스트는 계속 통과)
```

### 테스트 우선순위
1. **비즈니스 로직** (Rust 커맨드, 데이터 처리)
2. **사용자 인터랙션** (폼 제출, 검색)
3. **엣지 케이스** (빈 입력, 에러 상황)
4. UI 스타일링은 테스트 안 함

---

## Rust 테스트

### 디렉토리 구조
```
src-tauri/
├── src/
│   ├── commands/
│   │   ├── snippet.rs
│   │   └── snippet_test.rs    # 또는 같은 파일 내 #[cfg(test)]
│   └── db/
│       └── connection_test.rs
└── tests/                      # 통합 테스트
    └── integration_test.rs
```

### 단위 테스트 패턴

```rust
// src/commands/snippet.rs

pub fn validate_snippet_input(input: &CreateSnippetInput) -> Result<(), ValidationError> {
    if input.title.trim().is_empty() {
        return Err(ValidationError::EmptyTitle);
    }
    if input.title.len() > 200 {
        return Err(ValidationError::TitleTooLong);
    }
    if input.problem.trim().is_empty() {
        return Err(ValidationError::EmptyProblem);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // Given-When-Then 패턴
    #[test]
    fn validate_snippet_input_with_valid_data_returns_ok() {
        // Given
        let input = CreateSnippetInput {
            title: "Valid Title".to_string(),
            problem: "Some problem description".to_string(),
            solution: None,
            code: None,
            code_language: None,
            reference_url: None,
            tag_ids: vec![],
        };

        // When
        let result = validate_snippet_input(&input);

        // Then
        assert!(result.is_ok());
    }

    #[test]
    fn validate_snippet_input_with_empty_title_returns_error() {
        // Given
        let input = CreateSnippetInput {
            title: "   ".to_string(),  // 공백만
            problem: "Some problem".to_string(),
            ..Default::default()
        };

        // When
        let result = validate_snippet_input(&input);

        // Then
        assert!(matches!(result, Err(ValidationError::EmptyTitle)));
    }

    #[test]
    fn validate_snippet_input_with_long_title_returns_error() {
        // Given
        let input = CreateSnippetInput {
            title: "a".repeat(201),
            problem: "Some problem".to_string(),
            ..Default::default()
        };

        // When
        let result = validate_snippet_input(&input);

        // Then
        assert!(matches!(result, Err(ValidationError::TitleTooLong)));
    }
}
```

### 데이터베이스 테스트

```rust
// tests/db_test.rs

use rusqlite::Connection;
use tempfile::NamedTempFile;

fn setup_test_db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    // 스키마 초기화
    conn.execute_batch(include_str!("../migrations/001_initial.sql")).unwrap();
    conn
}

#[test]
fn create_snippet_inserts_into_database() {
    // Given
    let conn = setup_test_db();
    let input = CreateSnippetInput {
        title: "Test Snippet".to_string(),
        problem: "Test problem".to_string(),
        ..Default::default()
    };

    // When
    let result = db::create_snippet(&conn, &input);

    // Then
    assert!(result.is_ok());
    let snippet = result.unwrap();
    assert_eq!(snippet.title, "Test Snippet");
    assert!(!snippet.id.is_empty());
}

#[test]
fn get_snippet_returns_none_for_nonexistent_id() {
    // Given
    let conn = setup_test_db();

    // When
    let result = db::get_snippet(&conn, "nonexistent-id");

    // Then
    assert!(result.is_ok());
    assert!(result.unwrap().is_none());
}

#[test]
fn delete_snippet_removes_from_database() {
    // Given
    let conn = setup_test_db();
    let snippet = db::create_snippet(&conn, &test_input()).unwrap();

    // When
    let result = db::delete_snippet(&conn, &snippet.id);

    // Then
    assert!(result.is_ok());
    let found = db::get_snippet(&conn, &snippet.id).unwrap();
    assert!(found.is_none());
}
```

### 비동기 테스트

```rust
#[cfg(test)]
mod async_tests {
    use super::*;
    use tokio;

    #[tokio::test]
    async fn generate_solution_returns_non_empty_response() {
        // Skip if Ollama not running
        if !check_ollama_connection().await.unwrap_or(false) {
            eprintln!("Skipping: Ollama not available");
            return;
        }

        // Given
        let problem = "How to handle errors in Rust?";

        // When
        let result = generate_solution(problem, "llama3.2:3b").await;

        // Then
        assert!(result.is_ok());
        let solution = result.unwrap();
        assert!(!solution.is_empty());
    }
}
```

### 테스트 실행
```bash
# 모든 테스트
cd src-tauri && cargo test

# 특정 모듈
cargo test commands::snippet

# 특정 테스트
cargo test validate_snippet_input_with_valid_data

# 출력 보기
cargo test -- --nocapture
```

---

## React 테스트

### 디렉토리 구조
```
src/
├── components/
│   └── snippet/
│       ├── SnippetCard.tsx
│       └── SnippetCard.test.tsx
├── hooks/
│   ├── useSnippets.ts
│   └── useSnippets.test.ts
└── lib/
    ├── utils.ts
    └── utils.test.ts
```

### 컴포넌트 테스트 패턴

```tsx
// src/components/snippet/SnippetCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SnippetCard } from './SnippetCard'

const mockSnippet = {
  id: '1',
  title: 'Test Snippet',
  tags: [{ id: 't1', name: 'Docker' }],
  createdAt: '2024-01-15T10:00:00Z',
}

describe('SnippetCard', () => {
  it('renders snippet title', () => {
    // Given & When
    render(<SnippetCard snippet={mockSnippet} onClick={() => {}} />)

    // Then
    expect(screen.getByText('Test Snippet')).toBeInTheDocument()
  })

  it('renders all tags', () => {
    // Given & When
    render(<SnippetCard snippet={mockSnippet} onClick={() => {}} />)

    // Then
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('calls onClick with snippet id when clicked', () => {
    // Given
    const handleClick = vi.fn()
    render(<SnippetCard snippet={mockSnippet} onClick={handleClick} />)

    // When
    fireEvent.click(screen.getByRole('article'))

    // Then
    expect(handleClick).toHaveBeenCalledWith('1')
  })

  it('applies selected style when isSelected is true', () => {
    // Given & When
    render(
      <SnippetCard 
        snippet={mockSnippet} 
        onClick={() => {}} 
        isSelected={true} 
      />
    )

    // Then
    const card = screen.getByRole('article')
    expect(card).toHaveClass('border-primary')
  })
})
```

### 폼 테스트

```tsx
// src/components/snippet/SnippetForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SnippetForm } from './SnippetForm'

describe('SnippetForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<SnippetForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByLabelText(/제목/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/문제 상황/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/해결 방법/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/코드/i)).toBeInTheDocument()
  })

  it('submits form with entered data', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // When
    await user.type(screen.getByLabelText(/제목/i), 'Test Title')
    await user.type(screen.getByLabelText(/문제 상황/i), 'Test problem')
    await user.click(screen.getByRole('button', { name: /저장/i }))

    // Then
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
          problem: 'Test problem',
        })
      )
    })
  })

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // When - 제목 없이 제출 시도
    await user.type(screen.getByLabelText(/문제 상황/i), 'Test problem')
    await user.click(screen.getByRole('button', { name: /저장/i }))

    // Then
    expect(await screen.findByText(/제목을 입력해주세요/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // When
    await user.click(screen.getByRole('button', { name: /취소/i }))

    // Then
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('pre-fills form when editing existing snippet', () => {
    const existingSnippet = {
      id: '1',
      title: 'Existing Title',
      problem: 'Existing problem',
      solution: 'Existing solution',
      code: null,
      codeLanguage: null,
      referenceUrl: null,
      tags: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    render(
      <SnippetForm 
        snippet={existingSnippet}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )

    expect(screen.getByLabelText(/제목/i)).toHaveValue('Existing Title')
    expect(screen.getByLabelText(/문제 상황/i)).toHaveValue('Existing problem')
  })
})
```

### 훅 테스트

```tsx
// src/hooks/useSnippets.test.ts

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSnippets, useCreateSnippet } from './useSnippets'

// Tauri invoke 모킹
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

import { invoke } from '@tauri-apps/api/core'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useSnippets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches snippets successfully', async () => {
    // Given
    const mockSnippets = [
      { id: '1', title: 'Snippet 1', tags: [], createdAt: '2024-01-01' },
      { id: '2', title: 'Snippet 2', tags: [], createdAt: '2024-01-02' },
    ]
    vi.mocked(invoke).mockResolvedValue(mockSnippets)

    // When
    const { result } = renderHook(() => useSnippets(), {
      wrapper: createWrapper(),
    })

    // Then
    await waitFor(() => {
      expect(result.current.data).toEqual(mockSnippets)
    })
    expect(invoke).toHaveBeenCalledWith('list_snippets', { filter: undefined })
  })

  it('handles error state', async () => {
    // Given
    vi.mocked(invoke).mockRejectedValue(new Error('Database error'))

    // When
    const { result } = renderHook(() => useSnippets(), {
      wrapper: createWrapper(),
    })

    // Then
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})

describe('useCreateSnippet', () => {
  it('creates snippet and invalidates queries', async () => {
    // Given
    const newSnippet = { id: '3', title: 'New Snippet', /* ... */ }
    vi.mocked(invoke).mockResolvedValue(newSnippet)

    const { result } = renderHook(() => useCreateSnippet(), {
      wrapper: createWrapper(),
    })

    // When
    result.current.mutate({
      title: 'New Snippet',
      problem: 'New problem',
      tagIds: [],
    })

    // Then
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(invoke).toHaveBeenCalledWith('create_snippet', expect.any(Object))
  })
})
```

### 테스트 실행
```bash
# 모든 테스트
pnpm test

# Watch 모드
pnpm test -- --watch

# 커버리지
pnpm test -- --coverage

# 특정 파일
pnpm test SnippetCard
```

---

## 테스트 설정 파일

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### src/test/setup.ts
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Tauri API 전역 모킹
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// window.matchMedia 모킹 (다크 모드 테스트용)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

---

## 테스트 체크리스트

### 새 기능 추가 시
- [ ] 실패하는 테스트 먼저 작성
- [ ] 최소 코드로 테스트 통과
- [ ] 리팩토링 (테스트 유지)
- [ ] 엣지 케이스 테스트 추가

### PR 전 확인
- [ ] 모든 테스트 통과 (`pnpm test` & `cargo test`)
- [ ] 새 코드에 테스트 있음
- [ ] 커버리지 감소 없음
