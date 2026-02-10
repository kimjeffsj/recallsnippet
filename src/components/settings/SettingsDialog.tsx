import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { useOllamaStatus } from "@/hooks/useAI";
import { aiApi } from "@/lib/tauri";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { theme, toggleTheme } = useTheme();
  const { data: isConnected } = useOllamaStatus();
  const [models, setModels] = useState<string[]>([]);
  const [ollamaUrl, setOllamaUrl] = useState("");
  const [searchLimit, setSearchLimit] = useState("10");

  useEffect(() => {
    if (settings) {
      setOllamaUrl(settings.ollamaBaseUrl);
      setSearchLimit(String(settings.searchLimit));
    }
  }, [settings]);

  useEffect(() => {
    if (open && isConnected) {
      aiApi.listModels().then(setModels).catch(() => setModels([]));
    }
  }, [open, isConnected]);

  const handleSaveUrl = () => {
    if (ollamaUrl !== settings?.ollamaBaseUrl) {
      updateSettings.mutate({ ollamaBaseUrl: ollamaUrl });
    }
  };

  const handleSaveSearchLimit = () => {
    const limit = parseInt(searchLimit, 10);
    if (!isNaN(limit) && limit > 0 && limit !== settings?.searchLimit) {
      updateSettings.mutate({ searchLimit: limit });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appearance */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                data-testid="theme-toggle"
              >
                {theme === "dark" ? "Dark" : "Light"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* AI & Models */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              AI & Models
            </h3>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                Ollama {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {/* Ollama URL */}
            <div className="space-y-2">
              <Label htmlFor="ollama-url">Ollama Base URL</Label>
              <div className="flex gap-2">
                <Input
                  id="ollama-url"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
                <Button size="sm" variant="outline" onClick={handleSaveUrl}>
                  Save
                </Button>
              </div>
            </div>

            {/* LLM Model */}
            <div className="space-y-2">
              <Label>LLM Model</Label>
              <Select
                value={settings?.llmModel}
                onValueChange={(value) =>
                  updateSettings.mutate({ llmModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                  {models.length === 0 && (
                    <SelectItem value={settings?.llmModel ?? "qwen2.5-coder:7b"}>
                      {settings?.llmModel ?? "qwen2.5-coder:7b"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Embedding Model */}
            <div className="space-y-2">
              <Label>Embedding Model</Label>
              <Select
                value={settings?.embeddingModel}
                onValueChange={(value) =>
                  updateSettings.mutate({ embeddingModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                  {models.length === 0 && (
                    <SelectItem
                      value={settings?.embeddingModel ?? "nomic-embed-text"}
                    >
                      {settings?.embeddingModel ?? "nomic-embed-text"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Storage */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Storage
            </h3>

            {/* Data Path */}
            {settings?.dataPath && (
              <div className="space-y-2">
                <Label>Data Path</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  {settings.dataPath}
                </p>
              </div>
            )}

            {/* Search Limit */}
            <div className="space-y-2">
              <Label htmlFor="search-limit">Search Results Limit</Label>
              <div className="flex gap-2">
                <Input
                  id="search-limit"
                  type="number"
                  min={1}
                  max={50}
                  value={searchLimit}
                  onChange={(e) => setSearchLimit(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveSearchLimit}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
