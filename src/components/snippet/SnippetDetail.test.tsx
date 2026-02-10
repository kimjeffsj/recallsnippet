import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SnippetDetail } from "./SnippetDetail";
import type { Snippet } from "@/lib/types";

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
};

describe("SnippetDetail", () => {
  it("renders title and problem", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
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
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("Wrap in try/catch block")).toBeInTheDocument();
  });

  it("renders code block", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("renders reference URL", () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    const link = screen.getByText("https://example.com/docs");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://example.com/docs",
    );
  });

  it("calls onEdit when edit button clicked", () => {
    const handleEdit = vi.fn();
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={handleEdit}
        onDelete={() => {}}
      />,
    );

    fireEvent.click(screen.getByLabelText("Edit snippet"));
    expect(handleEdit).toHaveBeenCalledWith("s1");
  });

  it("calls onDelete after confirming delete dialog", () => {
    const handleDelete = vi.fn();
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onEdit={() => {}}
        onDelete={handleDelete}
      />,
    );

    // Click trash icon opens the dialog
    fireEvent.click(screen.getByLabelText("Delete snippet"));
    expect(handleDelete).not.toHaveBeenCalled();

    // Confirm in the dialog
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(handleDelete).toHaveBeenCalledWith("s1");
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
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.queryByText("Solution")).not.toBeInTheDocument();
    expect(screen.queryByText("Code")).not.toBeInTheDocument();
    expect(screen.queryByText("Reference")).not.toBeInTheDocument();
  });
});
