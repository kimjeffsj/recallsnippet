import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { CodeEditor } from "./CodeEditor";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve({ theme: "dark" })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("CodeEditor", () => {
  it("renders the editor container", () => {
    render(
      <CodeEditor value="" onChange={() => {}} />,
      { wrapper: createWrapper() },
    );
    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  });

  it("renders with a value", () => {
    render(
      <CodeEditor value="const x = 1;" onChange={() => {}} language="javascript" />,
      { wrapper: createWrapper() },
    );
    const container = screen.getByTestId("code-editor");
    expect(container).toBeInTheDocument();
    expect(container.querySelector(".cm-editor")).toBeTruthy();
  });

  it("applies readOnly mode", () => {
    render(
      <CodeEditor value="read only" onChange={() => {}} readOnly />,
      { wrapper: createWrapper() },
    );
    const container = screen.getByTestId("code-editor");
    expect(container.querySelector(".cm-editor")).toBeTruthy();
  });
});
