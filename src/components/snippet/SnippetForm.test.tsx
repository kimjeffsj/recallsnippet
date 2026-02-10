import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { SnippetForm } from "./SnippetForm";
import type { Tag, Snippet } from "@/lib/types";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

const mockTags: Tag[] = [
  { id: "t1", name: "rust" },
  { id: "t2", name: "async" },
];

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

function renderForm(props: Partial<React.ComponentProps<typeof SnippetForm>> = {}) {
  return render(
    <SnippetForm
      availableTags={mockTags}
      onSubmit={() => {}}
      onCancel={() => {}}
      {...props}
    />,
    { wrapper: createWrapper() },
  );
}

describe("SnippetForm", () => {
  it("renders create form", () => {
    renderForm();

    expect(screen.getByText("New Snippet")).toBeInTheDocument();
    expect(screen.getByLabelText("Title *")).toBeInTheDocument();
    expect(screen.getByLabelText("Problem *")).toBeInTheDocument();
  });

  it("renders edit form with existing data", () => {
    const snippet: Snippet = {
      id: "s1",
      title: "Existing Title",
      problem: "Existing Problem",
      solution: "Existing Solution",
      code: null,
      codeLanguage: null,
      referenceUrl: null,
      tags: [{ id: "t1", name: "rust" }],
      createdAt: "2026-02-07",
      updatedAt: "2026-02-07",
    };

    renderForm({ snippet });

    expect(screen.getByText("Edit Snippet")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Problem")).toBeInTheDocument();
  });

  it("submit button is disabled when required fields empty", () => {
    renderForm({ availableTags: [] });

    const submitButton = screen.getByText("Create");
    expect(submitButton).toBeDisabled();
  });

  it("calls onSubmit with form data", () => {
    const handleSubmit = vi.fn();
    renderForm({ onSubmit: handleSubmit });

    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByLabelText("Problem *"), {
      target: { value: "Test Problem" },
    });
    fireEvent.click(screen.getByText("Create"));

    expect(handleSubmit).toHaveBeenCalledWith({
      title: "Test Title",
      problem: "Test Problem",
      solution: undefined,
      code: undefined,
      codeLanguage: undefined,
      referenceUrl: undefined,
      tagIds: [],
    });
  });

  it("calls onCancel when cancel clicked", () => {
    const handleCancel = vi.fn();
    renderForm({ onCancel: handleCancel });

    fireEvent.click(screen.getByLabelText("Go back"));
    expect(handleCancel).toHaveBeenCalled();
  });

  it("toggles tag selection", () => {
    const handleSubmit = vi.fn();
    renderForm({ onSubmit: handleSubmit });

    // Fill required fields
    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "Title" },
    });
    fireEvent.change(screen.getByLabelText("Problem *"), {
      target: { value: "Problem" },
    });

    // Select a tag
    fireEvent.click(screen.getByText("rust"));

    // Submit
    fireEvent.click(screen.getByText("Create"));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tagIds: ["t1"],
      }),
    );
  });

  it("shows loading state", () => {
    renderForm({ availableTags: [], isLoading: true });

    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });
});
