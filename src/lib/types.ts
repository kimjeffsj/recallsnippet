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
}

export interface SnippetSummary {
  id: string;
  title: string;
  problem: string;
  codeLanguage: string | null;
  tags: Tag[];
  createdAt: string;
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
}

export interface Tag {
  id: string;
  name: string;
}

export interface SearchResult {
  snippet: SnippetSummary;
  score: number;
}
