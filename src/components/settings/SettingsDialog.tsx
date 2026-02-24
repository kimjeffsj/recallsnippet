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
import { Badge } from "@/components/ui/badge";
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

  const loadModels = () => {
    if (isConnected) {
      aiApi.listModels().then(setModels).catch(() => setModels([]));
    }
  };

  useEffect(() => {
    if (open) {
      loadModels();
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

            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value="ollama" disabled>
                <SelectTrigger data-testid="provider-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ollama">
                    <span className="flex items-center gap-2">
                      Ollama (Local)
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Active
                      </Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="cloud" disabled>
                    <span className="flex items-center gap-2">
                      Cloud API
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        Coming Soon
                      </Badge>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cloud API Key (hidden, prepared for future) */}
            {false && (
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                />
              </div>
            )}

            {/* Connection Status & Refresh */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
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
                {isConnected && (
                  <Button variant="ghost" size="sm" onClick={loadModels} className="h-6 px-2 text-xs">
                    Refresh Models
                  </Button>
                )}
              </div>

              {isConnected && models.length === 0 && (
                 <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
                   <p className="font-semibold">No models found in Ollama</p>
                   <p className="mt-1">
                     Open Terminal and run the following commands to install:
                     <br />
                     <code className="mt-1 block text-xs font-mono bg-yellow-500/20 px-1.5 py-1 rounded">ollama pull qwen2.5-coder:7b</code>
                     <code className="mt-1 block text-xs font-mono bg-yellow-500/20 px-1.5 py-1 rounded">ollama pull nomic-embed-text</code>
                   </p>
                 </div>
              )}
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
                  {settings && !models.includes(settings.llmModel) && (
                    <SelectItem value={settings.llmModel}>
                      {settings.llmModel} (Not installed)
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
                  {settings && !models.includes(settings.embeddingModel) && (
                    <SelectItem value={settings.embeddingModel}>
                      {settings.embeddingModel} (Not installed)
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
