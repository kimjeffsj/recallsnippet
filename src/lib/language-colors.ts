export const LANGUAGE_COLORS: Record<string, { color: string; abbr: string }> = {
  javascript: { color: "#f7df1e", abbr: "JS" },
  typescript: { color: "#3178c6", abbr: "TS" },
  python: { color: "#3572a5", abbr: "PY" },
  rust: { color: "#dea584", abbr: "RS" },
  go: { color: "#00add8", abbr: "GO" },
  java: { color: "#b07219", abbr: "JV" },
  sql: { color: "#e38c00", abbr: "SQL" },
  css: { color: "#663399", abbr: "CSS" },
  html: { color: "#e34c26", abbr: "HTML" },
  shell: { color: "#89e051", abbr: "SH" },
  bash: { color: "#89e051", abbr: "SH" },
  yaml: { color: "#cb171e", abbr: "YML" },
  json: { color: "#292929", abbr: "JSON" },
  markdown: { color: "#083fa1", abbr: "MD" },
  ruby: { color: "#701516", abbr: "RB" },
  php: { color: "#4f5d95", abbr: "PHP" },
  swift: { color: "#f05138", abbr: "SW" },
  kotlin: { color: "#a97bff", abbr: "KT" },
  c: { color: "#555555", abbr: "C" },
  cpp: { color: "#f34b7d", abbr: "C++" },
  csharp: { color: "#178600", abbr: "C#" },
  docker: { color: "#384d54", abbr: "DOC" },
  dockerfile: { color: "#384d54", abbr: "DOC" },
};

export function getLanguageInfo(language: string | null | undefined): {
  color: string;
  abbr: string;
} {
  if (!language) return { color: "#64748b", abbr: "?" };
  const key = language.toLowerCase();
  return LANGUAGE_COLORS[key] ?? { color: "#64748b", abbr: language.slice(0, 3).toUpperCase() };
}
