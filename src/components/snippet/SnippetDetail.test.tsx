import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SnippetDetail } from "./SnippetDetail";
import type { Snippet } from "@/lib/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockSnippet: Snippet = {
  id: "s1",
  title: "Fix async/await error",
  problem: "Getting unhandled promise rejection",
  solution: "Wrap in try/catch block",
  code: 'try { await fetch(); } catch(e) { console.error(e); }',
  codeLanguage: "typescript",
  referenceUrl: "https://example.com/docs",
  tags: [{ id: "t1", name: "async" }],
  createdAt: "2026-02-07",
  updatedAt: "2026-02-08",
  isFavorite: false,
  isDeleted: false,
  deletedAt: null,
  lastAccessedAt: null,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("SnippetDetail", () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onRestore = vi.fn();
  const onBack = vi.fn();

  it("renders title and problem", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
        onBack={onBack}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Fix async/await error")).toBeInTheDocument();
    expect(
      screen.getByText("Getting unhandled promise rejection"),
    ).toBeInTheDocument();
  });

  it("renders solution when present", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Wrap in try/catch block")).toBeInTheDocument();
  });

  it("renders code block", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("renders reference URL", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
      { wrapper: createWrapper() }
    );

    const link = screen.getByText("https://example.com/docs");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://example.com/docs",
    );
  });

  it("calls onEdit when edit button clicked", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByLabelText("Edit snippet"));
    expect(onEdit).toHaveBeenCalledWith("s1");
  });

  it("calls onDelete after confirming delete dialog", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
      { wrapper: createWrapper() }
    );

    // Click trash icon opens the dialog
    fireEvent.click(screen.getByLabelText("Delete snippet"));
    expect(onDelete).not.toHaveBeenCalled();

    // Confirm in the dialog
    fireEvent.click(screen.getByRole("button", { name: "Move to Trash" }));
    expect(onDelete).toHaveBeenCalledWith("s1");
  });

  it("hides optional sections when null", () => {
    const minSnippet: Snippet = {
      ...mockSnippet,
      solution: null,
      code: null,
      referenceUrl: null,
    };
    render(
      <SnippetDetail
        snippet={minSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText("Solution")).not.toBeInTheDocument();
    expect(screen.queryByText("Code")).not.toBeInTheDocument();
    expect(screen.queryByText("External Link")).not.toBeInTheDocument();
  });

  it("shows delete permanently when isDeleted is true", () => {
    const deletedSnippet = { ...mockSnippet, isDeleted: true };
    render(
      <SnippetDetail
        snippet={deletedSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByLabelText("Delete snippet"));
    expect(screen.getByText("Delete Permanently")).toBeInTheDocument();
  });

  it("calls onRestore when restore button clicked", () => {
    const deletedSnippet = { ...mockSnippet, isDeleted: true };
    render(
      <SnippetDetail
        snippet={deletedSnippet}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByLabelText("Restore snippet"));
    expect(onRestore).toHaveBeenCalledWith("s1");
  });
});
