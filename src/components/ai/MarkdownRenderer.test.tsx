import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MarkdownRenderer } from "./MarkdownRenderer";

vi.mock("react-syntax-highlighter", () => ({
  default: ({ children }: { children: string }) => (
    <pre data-testid="syntax-highlighter">{children}</pre>
  ),
}));

vi.mock("react-syntax-highlighter/dist/esm/styles/hljs", () => ({
  atomOneDark: {},
}));

describe("MarkdownRenderer", () => {
  it("renders plain text", () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders inline code", () => {
    render(<MarkdownRenderer content="Use `docker restart` command" />);
    const code = screen.getByText("docker restart");
    expect(code.tagName).toBe("CODE");
  });

  it("renders fenced code blocks with syntax highlighter", () => {
    const content = "```javascript\nconsole.log('hi');\n```";
    render(<MarkdownRenderer content={content} />);
    expect(screen.getByTestId("syntax-highlighter")).toBeInTheDocument();
    expect(screen.getByText("console.log('hi');")).toBeInTheDocument();
  });

  it("renders headings", () => {
    render(<MarkdownRenderer content="## My Heading" />);
    expect(screen.getByText("My Heading")).toBeInTheDocument();
  });

  it("renders unordered lists", () => {
    const { container } = render(<MarkdownRenderer content={"- Item 1\n- Item 2"} />);
    const ul = container.querySelector("ul");
    expect(ul).toBeInTheDocument();
  });

  it("renders ordered lists", () => {
    const { container } = render(<MarkdownRenderer content={"1. First\n2. Second"} />);
    const ol = container.querySelector("ol");
    expect(ol).toBeInTheDocument();
  });

  it("renders blockquotes", () => {
    render(<MarkdownRenderer content="> Important note" />);
    expect(screen.getByText("Important note")).toBeInTheDocument();
  });

  it("renders GFM tables", () => {
    const content = "| A | B |\n|---|---|\n| 1 | 2 |";
    render(<MarkdownRenderer content={content} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
