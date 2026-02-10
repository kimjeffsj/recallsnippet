import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useAIChat } from "@/hooks/useAI";

export interface SnippetContext {
  title: string;
  problem: string;
  solution?: string;
  code?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SpotlightChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snippetContext?: SnippetContext;
}

export function SpotlightChat({
  open,
  onOpenChange,
  snippetContext,
}: SpotlightChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = useAIChat();

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setMessages([]);
      setInput("");
    }
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    chatMutation.mutate(
      { message: trimmed, snippetContext },
      {
        onSuccess: (response) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: response },
          ]);
        },
        onError: (error) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${error instanceof Error ? error.message : "Failed to get response. Is Ollama running?"}`,
            },
          ]);
        },
      },
    );
  }, [input, chatMutation, snippetContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">AI Spotlight Chat</DialogTitle>
        <DialogDescription className="sr-only">
          Search your knowledge base using natural language
        </DialogDescription>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">Recall Assistant</h3>
            {snippetContext && (
              <p className="text-xs text-muted-foreground truncate">
                Context: {snippetContext.title}
              </p>
            )}
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ⌘J
          </kbd>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0 max-h-[50vh]">
          <div ref={scrollRef} className="p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Ask about your snippets</p>
                <p className="text-xs mt-1">
                  Search your knowledge base using natural language
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                snippetContext
                  ? "Ask about this snippet..."
                  : "Search your knowledge base..."
              }
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={chatMutation.isPending}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              aria-label="Send message"
              className="h-8 w-8 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
