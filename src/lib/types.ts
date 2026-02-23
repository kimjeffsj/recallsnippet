export interface Snippet {
  id: string;
  title: string;
  problem: string;
  solution: string | null;
  code: string | null;
  codeLanguage: string | null;
  referenceUrl: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  lastAccessedAt: string | null;
}

export interface SnippetSummary {
  id: string;
  title: string;
  problem: string;
  codeLanguage: string | null;
  codePreview: string | null;
  tags: Tag[];
  createdAt: string;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  lastAccessedAt: string | null;
}

export interface CreateSnippetInput {
  title: string;
  problem: string;
  solution?: string;
  code?: string;
  codeLanguage?: string;
  referenceUrl?: string;
  tagIds: string[];
}

export interface UpdateSnippetInput {
  title?: string;
  problem?: string;
  solution?: string;
  code?: string;
  codeLanguage?: string;
  referenceUrl?: string;
  tagIds?: string[];
}

export interface SnippetFilter {
  language?: string;
  search?: string;
  favoritesOnly?: boolean;
  trashOnly?: boolean;
  includeDeleted?: boolean;
  recentFirst?: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface SearchResult {
  snippet: SnippetSummary;
  score: number;
}

export interface Settings {
  theme: string;
  ollamaBaseUrl: string;
  llmModel: string;
  embeddingModel: string;
  searchLimit: number;
  dataPath: string | null;
}

export interface SnippetSource {
  id: string;
  title: string;
  score: number;
}

export interface AiChatResponse {
  answer: string;
  sources: SnippetSource[];
}

export interface SnippetContext {
  title: string;
  problem: string;
  solution?: string;
  code?: string;
}

export interface UpdateSettingsInput {
  theme?: string;
  ollamaBaseUrl?: string;
  llmModel?: string;
  embeddingModel?: string;
  searchLimit?: number;
  dataPath?: string;
}
