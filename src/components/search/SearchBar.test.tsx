import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("renders with placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("Search snippets...")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Type here..." />);
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "docker" },
    });

    expect(handleChange).toHaveBeenCalledWith("docker");
  });

  it("shows clear button when value is present", () => {
    render(<SearchBar value="test" onChange={() => {}} />);
    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("does not show clear button when value is empty", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });

  it("calls onChange with empty string when clear clicked", () => {
    const handleChange = vi.fn();
    render(<SearchBar value="test" onChange={handleChange} />);

    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(handleChange).toHaveBeenCalledWith("");
  });
});
