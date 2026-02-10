import { invoke } from "@tauri-apps/api/core";
import type {
  Snippet,
  SnippetSummary,
  CreateSnippetInput,
  UpdateSnippetInput,
  SnippetFilter,
  Tag,
  SearchResult,
  Settings,
  UpdateSettingsInput,
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

export const searchApi = {
  semantic: (query: string, limit?: number) =>
    invoke<SearchResult[]>("semantic_search", { query, limit }),
};

export const aiApi = {
  checkConnection: () => invoke<boolean>("check_ollama_connection"),

  listModels: () => invoke<string[]>("list_ollama_models"),

  generateSolution: (problem: string, model?: string) =>
    invoke<string>("generate_solution", { problem, model }),

  suggestTags: (content: string, model?: string) =>
    invoke<string[]>("suggest_tags", { content, model }),

  chat: (message: string, snippetContext?: { title: string; problem: string; solution?: string; code?: string }) =>
    invoke<string>("ai_chat", { message, snippetContext }),
};

export const tagApi = {
  list: () => invoke<Tag[]>("list_tags"),

  create: (name: string) => invoke<Tag>("create_tag", { name }),

  delete: (id: string) => invoke<void>("delete_tag", { id }),
};

export const settingsApi = {
  get: () => invoke<Settings>("get_settings"),

  update: (input: UpdateSettingsInput) =>
    invoke<Settings>("update_settings", { input }),
};
