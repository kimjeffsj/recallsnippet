import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/tauri";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SourceCards } from "./SourceCards";
import type { SnippetContext, SnippetSource } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SnippetSource[];
}

interface SpotlightChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSnippet: (id: string) => void;
  snippetContext?: SnippetContext;
}

export function SpotlightChat({
  open,
  onOpenChange,
  onSelectSnippet,
  snippetContext,
}: SpotlightChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Reset on close, focus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      setMessages([]);
      setInput("");
      setIsLoading(false);
      setElapsedSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Elapsed time timer
  useEffect(() => {
    if (isLoading) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiApi.chat(trimmed, snippetContext);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : String(err)}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, snippetContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSourceSelect = (id: string) => {
    onSelectSnippet(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Recall Assistant</DialogTitle>
        <DialogDescription className="sr-only">
          Ask questions about your code snippet knowledge base
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">Recall Assistant</h3>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ⌘J
          </kbd>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Ask your knowledge base</p>
                <p className="text-xs mt-1">
                  Ask questions and get answers from your saved snippets
                </p>
                {snippetContext && (
                  <div className="mt-3 px-3 py-2 bg-muted rounded-lg text-xs text-left inline-block max-w-sm">
                    <span className="font-medium text-foreground">Context:</span>{" "}
                    {snippetContext.title}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 overflow-hidden min-w-0 break-words ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <>
                      <MarkdownRenderer content={msg.content} />
                      {msg.sources && msg.sources.length > 0 && (
                        <SourceCards
                          sources={msg.sources}
                          onSelect={handleSourceSelect}
                        />
                      )}
                    </>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Thinking
                    {elapsedSeconds >= 5 && (
                      <span className="ml-1 text-xs">({elapsedSeconds}s)</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your snippets..."
              rows={1}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground resize-none max-h-32 min-h-[36px] py-2"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="shrink-0 text-muted-foreground hover:text-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
