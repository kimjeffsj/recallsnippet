import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { HomePage } from "./HomePage";
import type { SnippetSummary, Snippet, Tag } from "@/lib/types";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
const mockInvoke = vi.mocked(invoke);

const mockTags: Tag[] = [
  { id: "t1", name: "rust" },
  { id: "t2", name: "async" },
];

const mockSummaries: SnippetSummary[] = [
  {
    id: "s1",
    title: "Fix borrow checker",
    problem: "Cannot borrow as mutable",
    codeLanguage: "rust",
    codePreview: null,
    tags: [mockTags[0]],
    createdAt: "2026-02-09",
  },
  {
    id: "s2",
    title: "Async timeout",
    problem: "Future times out",
    codeLanguage: "typescript",
    codePreview: null,
    tags: [mockTags[1]],
    createdAt: "2026-02-09",
  },
];

const mockSnippet: Snippet = {
  id: "s1",
  title: "Fix borrow checker",
  problem: "Cannot borrow as mutable",
  solution: "Use Rc<RefCell<T>>",
  code: "use std::rc::Rc;",
  codeLanguage: "rust",
  referenceUrl: null,
  tags: [mockTags[0]],
  createdAt: "2026-02-09",
  updatedAt: "2026-02-09",
};

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

function renderHomePage() {
  return render(<HomePage />, { wrapper: createWrapper() });
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks: list_snippets, list_tags
    mockInvoke.mockImplementation((cmd: string) => {
      if (cmd === "list_snippets") return Promise.resolve(mockSummaries);
      if (cmd === "list_tags") return Promise.resolve(mockTags);
      if (cmd === "get_snippet") return Promise.resolve(mockSnippet);
      if (cmd === "create_snippet")
        return Promise.resolve({ ...mockSnippet, id: "s3" });
      if (cmd === "update_snippet") return Promise.resolve(mockSnippet);
      if (cmd === "delete_snippet") return Promise.resolve(undefined);
      if (cmd === "check_ollama_connection") return Promise.resolve(false);
      return Promise.resolve(undefined);
    });
  });

  it("renders snippet list on initial load", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("Fix borrow checker")).toBeInTheDocument();
    });
    expect(screen.getByText("Async timeout")).toBeInTheDocument();
  });

  it("shows New Snippet button in sidebar", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("New Snippet")).toBeInTheDocument();
    });
  });

  it("navigates to create form when New Snippet clicked", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("New Snippet")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("New Snippet"));
    expect(screen.getByText("New Snippet", { selector: "h2" })).toBeInTheDocument();
    expect(screen.getByLabelText("Title *")).toBeInTheDocument();
  });

  it("navigates to detail view when snippet selected", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("Fix borrow checker")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Fix borrow checker"));

    await waitFor(() => {
      expect(screen.getByText("Cannot borrow as mutable")).toBeInTheDocument();
    });
  });

  it("creates a new snippet", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("New Snippet")).toBeInTheDocument();
    });

    // Go to create form
    fireEvent.click(screen.getByText("New Snippet"));

    // Fill required fields
    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "New Test" },
    });
    fireEvent.change(screen.getByLabelText("Problem *"), {
      target: { value: "New Problem" },
    });

    // Submit
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "create_snippet",
        expect.objectContaining({
          input: expect.objectContaining({
            title: "New Test",
            problem: "New Problem",
          }),
        }),
      );
    });
  });

  it("navigates to edit form from detail view", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("Fix borrow checker")).toBeInTheDocument();
    });

    // Select snippet
    fireEvent.click(screen.getByText("Fix borrow checker"));

    await waitFor(() => {
      expect(screen.getByLabelText("Edit snippet")).toBeInTheDocument();
    });

    // Click edit
    fireEvent.click(screen.getByLabelText("Edit snippet"));

    await waitFor(() => {
      expect(screen.getByText("Edit Snippet")).toBeInTheDocument();
    });
  });

  it("deletes a snippet from detail view", async () => {
    // Mock window.confirm
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("Fix borrow checker")).toBeInTheDocument();
    });

    // Select snippet
    fireEvent.click(screen.getByText("Fix borrow checker"));

    await waitFor(() => {
      expect(screen.getByLabelText("Delete snippet")).toBeInTheDocument();
    });

    // Click delete
    fireEvent.click(screen.getByLabelText("Delete snippet"));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("delete_snippet", { id: "s1" });
    });
  });

  it("shows empty state when no snippets", async () => {
    mockInvoke.mockImplementation((cmd: string) => {
      if (cmd === "list_snippets") return Promise.resolve([]);
      if (cmd === "list_tags") return Promise.resolve([]);
      return Promise.resolve(undefined);
    });

    renderHomePage();

    await waitFor(() => {
      expect(
        screen.getByText("No snippets yet"),
      ).toBeInTheDocument();
    });
  });
});
