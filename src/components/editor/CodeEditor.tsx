import { useRef, useEffect, useCallback } from "react";
import { EditorView, placeholder as cmPlaceholder, keymap } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { indentWithTab } from "@codemirror/commands";
import { useTheme } from "@/hooks/useTheme";

function getLanguageExtension(lang?: string) {
  if (!lang) return [];
  switch (lang.toLowerCase()) {
    case "javascript":
    case "js":
      return [javascript()];
    case "typescript":
    case "ts":
      return [javascript({ typescript: true })];
    case "jsx":
      return [javascript({ jsx: true })];
    case "tsx":
      return [javascript({ typescript: true, jsx: true })];
    case "python":
    case "py":
      return [python()];
    case "rust":
    case "rs":
      return [rust()];
    case "html":
      return [html()];
    case "css":
      return [css()];
    case "json":
      return [json()];
    default:
      return [];
  }
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  placeholder = "Paste relevant code",
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const languageCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const { theme } = useTheme();

  onChangeRef.current = onChange;

  const createThemeExtension = useCallback(
    (currentTheme: string) => {
      if (currentTheme === "dark") {
        return oneDark;
      }
      return EditorView.theme({});
    },
    [],
  );

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        languageCompartment.current.of(getLanguageExtension(language)),
        themeCompartment.current.of(createThemeExtension(theme)),
        readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
        cmPlaceholder(placeholder),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": {
            fontSize: "14px",
            fontFamily: "var(--font-mono)",
          },
          "&.cm-focused": {
            outline: "none",
          },
          ".cm-scroller": {
            minHeight: "200px",
            maxHeight: "500px",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // Update language
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: languageCompartment.current.reconfigure(
        getLanguageExtension(language),
      ),
    });
  }, [language]);

  // Update theme
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.current.reconfigure(
        createThemeExtension(theme),
      ),
    });
  }, [theme, createThemeExtension]);

  // Update readOnly
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyCompartment.current.reconfigure(
        EditorState.readOnly.of(readOnly),
      ),
    });
  }, [readOnly]);

  return (
    <div
      ref={containerRef}
      data-testid="code-editor"
      className="rounded-lg border border-input overflow-hidden [&_.cm-editor]:bg-background"
    />
  );
}
