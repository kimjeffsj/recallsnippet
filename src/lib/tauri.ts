import { invoke } from "@tauri-apps/api/core";
import type {
  Snippet,
  SnippetSummary,
  CreateSnippetInput,
  UpdateSnippetInput,
  SnippetFilter,
  Tag,
} from "./types";

export const snippetApi = {
  create: (input: CreateSnippetInput) =>
    invoke<Snippet>("create_snippet", { input }),

  get: (id: string) => invoke<Snippet>("get_snippet", { id }),

  list: (filter?: SnippetFilter) =>
    invoke<SnippetSummary[]>("list_snippets", { filter }),

  update: (id: string, input: UpdateSnippetInput) =>
    invoke<Snippet>("update_snippet", { id, input }),

  delete: (id: string) => invoke<void>("delete_snippet", { id }),
};

export const tagApi = {
  list: () => invoke<Tag[]>("list_tags"),

  create: (name: string) => invoke<Tag>("create_tag", { name }),

  delete: (id: string) => invoke<void>("delete_tag", { id }),
};
