import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SnippetList } from "./SnippetList";
import type { SnippetSummary } from "@/lib/types";

const mockSnippets: SnippetSummary[] = [
  {
    id: "s1",
    title: "First Snippet",
    problem: "First problem",
    codeLanguage: "rust",
    codePreview: "fn main() {}",
    tags: [],
    createdAt: "2026-02-07",
  },
  {
    id: "s2",
    title: "Second Snippet",
    problem: "Second problem",
    codeLanguage: "python",
    codePreview: null,
    tags: [{ id: "t1", name: "web" }],
    createdAt: "2026-02-08",
  },
];

describe("SnippetList", () => {
  it("renders loading state with skeleton cards", () => {
    render(
      <SnippetList
        snippets={[]}
        selectedId={null}
        onSelect={() => {}}
        isLoading={true}
      />,
    );

    // Skeleton cards should have animate-pulse class
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state", () => {
    render(
      <SnippetList
        snippets={[]}
        selectedId={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("No snippets yet")).toBeInTheDocument();
  });

  it("renders snippet cards", () => {
    render(
      <SnippetList
        snippets={mockSnippets}
        selectedId={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("First Snippet")).toBeInTheDocument();
    expect(screen.getByText("Second Snippet")).toBeInTheDocument();
  });

  it("shows snippet count in header", () => {
    render(
      <SnippetList
        snippets={mockSnippets}
        selectedId={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("2 snippets")).toBeInTheDocument();
  });

  it("calls onSelect when card is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <SnippetList
        snippets={mockSnippets}
        selectedId={null}
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByText("First Snippet"));
    expect(handleSelect).toHaveBeenCalledWith("s1");
  });

  it("marks selected card", () => {
    render(
      <SnippetList
        snippets={mockSnippets}
        selectedId="s1"
        onSelect={() => {}}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[0].className).toContain("border-primary");
    expect(buttons[1].className).not.toContain("border-primary shadow-lg");
  });
});
