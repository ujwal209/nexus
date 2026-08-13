// ─── Canvas Editor Shared Types ───────────────────────────────────────────

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

export interface CanvasNode {
  id: string;
  type: "trigger" | "llm" | "tool" | "memory" | "database" | "app";
  title: string;
  subtitle: string;
  status: "idle" | "running" | "success" | "error";
  x: number;
  y: number;
  isCollapsed?: boolean;
  isConfigured?: boolean;
  output?: any;
  iconUrl: string;
  colorClass: string;
  category?: string;
  config: {
    provider?: string;
    model?: string;
    fallbackModel?: string | null;
    temperature?: number;
    topP?: number;
    freqPenalty?: number;
    presPenalty?: number;
    systemPrompt?: string;
    maxTokens?: number;
    responseFormat?: string;
    searchDepth?: string;
    maxResults?: number;
    timeout?: number;
    maxRetries?: number;
    retryStrategy?: string;
    cacheEnabled?: boolean;
    memoryLimit?: number;
    concurrency?: number;
    priority?: string;
    jsonGuardrail?: string;
    customHeaders?: string;
    query?: string;
    connectionString?: string;
    webhookUrl?: string;
    apiKey?: string;
    envVar?: string;
    topK?: number;
    // REST
    method?: string;
    url?: string;
    headers?: string;
    body?: string;
    auth?: string;
    // Gmail Sender
    email?: string;
    password?: string;
    recipients?: string;
    subject?: string;
    bodyHtml?: string;
    // Gmail Listener
    filterFrom?: string;
    filterSubject?: string;
    pollIntervalSec?: number;
    markAsRead?: boolean;
    // Generic app
    appToken?: string;
    appDestination?: string;
    appTemplate?: string;
  };
}

export interface PaletteNodeDef {
  type: "trigger" | "llm" | "tool" | "memory" | "database" | "app";
  title: string;
  subtitle: string;
  category: "Triggers" | "LLM Providers" | "Developer Tools" | "Apps & APIs" | "Databases & Memory";
  iconUrl: string;
  colorClass: string;
  providerId?: string;
}
