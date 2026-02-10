import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchResults } from "./SearchResults";
import type { SearchResult } from "@/lib/types";

const mockResults: SearchResult[] = [
  {
    snippet: {
      id: "s1",
      title: "Docker networking fix",
      problem: "Container cannot reach host",
      codeLanguage: "bash",
      codePreview: null,
      tags: [{ id: "t1", name: "docker" }],
      createdAt: "2026-02-09",
    },
    score: 0.95,
  },
  {
    snippet: {
      id: "s2",
      title: "Rust async patterns",
      problem: "How to use tokio properly",
      codeLanguage: "rust",
      codePreview: null,
      tags: [{ id: "t2", name: "async" }],
      createdAt: "2026-02-09",
    },
    score: 0.72,
  },
];

describe("SearchResults", () => {
  it("renders results with titles", () => {
    render(<SearchResults results={mockResults} onSelect={() => {}} />);

    expect(screen.getByText("Docker networking fix")).toBeInTheDocument();
    expect(screen.getByText("Rust async patterns")).toBeInTheDocument();
  });

  it("shows similarity score as percentage", () => {
    render(<SearchResults results={mockResults} onSelect={() => {}} />);

    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("shows language badges", () => {
    render(<SearchResults results={mockResults} onSelect={() => {}} />);

    expect(screen.getByText("bash")).toBeInTheDocument();
    expect(screen.getByText("rust")).toBeInTheDocument();
  });

  it("shows tag badges", () => {
    render(<SearchResults results={mockResults} onSelect={() => {}} />);

    expect(screen.getByText("docker")).toBeInTheDocument();
    expect(screen.getByText("async")).toBeInTheDocument();
  });

  it("calls onSelect when result clicked", () => {
    const handleSelect = vi.fn();
    render(<SearchResults results={mockResults} onSelect={handleSelect} />);

    fireEvent.click(screen.getByText("Docker networking fix"));
    expect(handleSelect).toHaveBeenCalledWith("s1");
  });

  it("shows loading state", () => {
    render(<SearchResults results={[]} onSelect={() => {}} isLoading />);
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<SearchResults results={[]} onSelect={() => {}} />);
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });
});
