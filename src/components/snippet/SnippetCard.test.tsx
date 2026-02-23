import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SnippetCard } from "./SnippetCard";
import type { SnippetSummary } from "@/lib/types";

const mockSnippet: SnippetSummary = {
  id: "s1",
  title: "Fix async/await error",
  problem: "Getting unhandled promise rejection when using async/await",
  codeLanguage: "typescript",
  codePreview: 'const result = await fetchData();',
  tags: [
    { id: "t1", name: "async" },
    { id: "t2", name: "error-handling" },
  ],
  createdAt: "2026-02-07",
  isFavorite: false,
  isDeleted: false,
  deletedAt: null,
  lastAccessedAt: null,
};

describe("SnippetCard", () => {
  it("renders title and problem", () => {
    render(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("Fix async/await error")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Getting unhandled promise rejection when using async/await",
      ),
    ).toBeInTheDocument();
  });

  it("renders language badge with abbreviation", () => {
    render(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("TS")).toBeInTheDocument();
  });

  it("renders tag badges with hash prefix", () => {
    render(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("#async")).toBeInTheDocument();
    expect(screen.getByText("#error-handling")).toBeInTheDocument();
  });

  it("renders code preview", () => {
    render(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("const result = await fetchData();")).toBeInTheDocument();
  });

  it("calls onClick with snippet id", () => {
    const handleClick = vi.fn();
    render(
      <SnippetCard snippet={mockSnippet} onClick={handleClick} />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledWith("s1");
  });

  it("applies selected styles when isSelected", () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onClick={() => {}}
        isSelected={true}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.className).toContain("border-primary");
  });

  it("renders fallback badge when codeLanguage is null", () => {
    const snippetNoLang: SnippetSummary = {
      ...mockSnippet,
      codeLanguage: null,
    };
    render(
      <SnippetCard snippet={snippetNoLang} onClick={() => {}} />,
    );

    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByText("Fix async/await error")).toBeInTheDocument();
  });

  it("renders timeAgo for createdAt", () => {
    render(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    // Should show some time ago text (e.g., "2d ago" or similar)
    const footer = screen.getByText(/ago|just now/i);
    expect(footer).toBeInTheDocument();
  });
});
