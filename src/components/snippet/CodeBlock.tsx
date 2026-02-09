import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "text" }: CodeBlockProps) {
  return (
    <div className="rounded-md overflow-hidden text-sm">
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          borderRadius: "0.375rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
