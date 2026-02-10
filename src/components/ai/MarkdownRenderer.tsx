import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match && !className;

          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded text-xs bg-muted font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <SyntaxHighlighter
              language={match?.[1] || "text"}
              style={atomOneDark}
              customStyle={{
                margin: 0,
                padding: "1rem",
                borderRadius: "0.5rem",
                fontSize: "0.8125rem",
              }}
              PreTag="div"
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        },
        h1({ children }) {
          return <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-bold mt-3 mb-1">{children}</h3>;
        },
        p({ children }) {
          return <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>;
        },
        ul({ children }) {
          return <ul className="text-sm list-disc pl-5 mb-2 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="text-sm list-decimal pl-5 mb-2 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic text-sm">
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="text-sm border-collapse w-full">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-border px-3 py-1.5 bg-muted text-left font-medium text-xs">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-border px-3 py-1.5 text-xs">{children}</td>
          );
        },
        pre({ children }) {
          return <div className="my-2">{children}</div>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
