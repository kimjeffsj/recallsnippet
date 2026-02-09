import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import {
  useSnippets,
  useSnippet,
  useCreateSnippet,
  useUpdateSnippet,
  useDeleteSnippet,
} from "./useSnippets";
import type { SnippetSummary, Snippet } from "@/lib/types";

// Mock @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
const mockInvoke = vi.mocked(invoke);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockSummary: SnippetSummary = {
  id: "s1",
  title: "Test Snippet",
  problem: "Test problem",
  codeLanguage: "rust",
  tags: [{ id: "t1", name: "rust" }],
  createdAt: "2026-02-07",
};

const mockSnippet: Snippet = {
  ...mockSummary,
  solution: "Test solution",
  code: "fn main() {}",
  referenceUrl: null,
  updatedAt: "2026-02-07",
};

describe("useSnippets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches snippet list", async () => {
    // Given
    mockInvoke.mockResolvedValueOnce([mockSummary]);

    // When
    const { result } = renderHook(() => useSnippets(), {
      wrapper: createWrapper(),
    });

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockSummary]);
    expect(mockInvoke).toHaveBeenCalledWith("list_snippets", {
      filter: undefined,
    });
  });

  it("fetches snippet list with filter", async () => {
    // Given
    mockInvoke.mockResolvedValueOnce([mockSummary]);
    const filter = { language: "rust" };

    // When
    const { result } = renderHook(() => useSnippets(filter), {
      wrapper: createWrapper(),
    });

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockInvoke).toHaveBeenCalledWith("list_snippets", { filter });
  });

  it("handles fetch error", async () => {
    // Given
    mockInvoke.mockRejectedValueOnce("Database error");

    // When
    const { result } = renderHook(() => useSnippets(), {
      wrapper: createWrapper(),
    });

    // Then
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useSnippet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches single snippet by id", async () => {
    // Given
    mockInvoke.mockResolvedValueOnce(mockSnippet);

    // When
    const { result } = renderHook(() => useSnippet("s1"), {
      wrapper: createWrapper(),
    });

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSnippet);
    expect(mockInvoke).toHaveBeenCalledWith("get_snippet", { id: "s1" });
  });

  it("does not fetch when id is null", () => {
    // Given & When
    mockInvoke.mockResolvedValueOnce(mockSnippet);
    const { result } = renderHook(() => useSnippet(null), {
      wrapper: createWrapper(),
    });

    // Then
    expect(result.current.fetchStatus).toBe("idle");
    expect(mockInvoke).not.toHaveBeenCalled();
  });
});

describe("useCreateSnippet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a snippet", async () => {
    // Given
    mockInvoke.mockResolvedValueOnce(mockSnippet);
    const input = {
      title: "Test",
      problem: "Problem",
      tagIds: ["t1"],
    };

    // When
    const { result } = renderHook(() => useCreateSnippet(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(input);

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockInvoke).toHaveBeenCalledWith("create_snippet", { input });
  });
});

describe("useUpdateSnippet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a snippet", async () => {
    // Given
    mockInvoke.mockResolvedValueOnce(mockSnippet);

    // When
    const { result } = renderHook(() => useUpdateSnippet(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: "s1", input: { title: "New Title" } });

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockInvoke).toHaveBeenCalledWith("update_snippet", {
      id: "s1",
      input: { title: "New Title" },
    });
  });
});

describe("useDeleteSnippet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a snippet", async () => {
    // Given
    mockInvoke.mockResolvedValueOnce(undefined);

    // When
    const { result } = renderHook(() => useDeleteSnippet(), {
      wrapper: createWrapper(),
    });
    result.current.mutate("s1");

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockInvoke).toHaveBeenCalledWith("delete_snippet", { id: "s1" });
  });
});
