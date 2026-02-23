import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

function renderWithClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe("SnippetCard", () => {
  it("renders title and problem", () => {
    renderWithClient(
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
    renderWithClient(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("TS")).toBeInTheDocument();
  });

  it("renders tag badges with hash prefix", () => {
    renderWithClient(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("#async")).toBeInTheDocument();
    expect(screen.getByText("#error-handling")).toBeInTheDocument();
  });

  it("renders code preview", () => {
    const { container } = renderWithClient(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(container.textContent).toContain("const result = await fetchData();");
  });

  it("calls onClick with snippet id", () => {
    const handleClick = vi.fn();
    renderWithClient(
      <SnippetCard snippet={mockSnippet} onClick={handleClick} />,
    );

    fireEvent.click(screen.getByText("Fix async/await error"));
    expect(handleClick).toHaveBeenCalledWith("s1");
  });

  it("applies selected styles when isSelected", () => {
    renderWithClient(
      <SnippetCard
        snippet={mockSnippet}
        onClick={() => {}}
        isSelected={true}
      />,
    );

    const card = screen.getByText("Fix async/await error").closest("div[role='button']");
    expect(card?.className).toContain("border-primary");
  });

  it("renders fallback badge when codeLanguage is null", () => {
    const snippetNoLang: SnippetSummary = {
      ...mockSnippet,
      codeLanguage: null,
    };
    renderWithClient(
      <SnippetCard snippet={snippetNoLang} onClick={() => {}} />,
    );

    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByText("Fix async/await error")).toBeInTheDocument();
  });

  it("renders timeAgo for createdAt", () => {
    renderWithClient(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    // Should show some time ago text (e.g., "2d ago" or similar)
    const footer = screen.getByText(/ago|just now/i);
    expect(footer).toBeInTheDocument();
  });

  it("calls onRestore when restore button clicked for deleted snippet", () => {
    const deletedSnippet: SnippetSummary = {
      ...mockSnippet,
      isDeleted: true,
    };
    const handleRestore = vi.fn();
    renderWithClient(
      <SnippetCard
        snippet={deletedSnippet}
        onClick={() => {}}
        onRestore={handleRestore}
      />,
    );

    const restoreButton = screen.getByLabelText("Restore Snippet");
    fireEvent.click(restoreButton);
    expect(handleRestore).toHaveBeenCalledWith("s1", expect.any(Object));
  });
});
