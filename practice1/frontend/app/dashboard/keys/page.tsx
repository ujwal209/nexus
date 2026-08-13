"use client";

import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { DashboardContext } from "@/context/DashboardContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface ToolIntegration {
  key: string;
  name: string;
  category: "Triggers" | "LLM Providers" | "Developer Tools" | "Apps & APIs" | "Databases & Memory";
  favicon: string;
  placeholder: string;
  description: string;
}

const INTEGRATIONS: ToolIntegration[] = [
  // TRIGGERS
  {
    key: "webhook_trigger_url",
    name: "Webhook Trigger",
    category: "Triggers",
    favicon: "https://svgl.app/library/postman.svg",
    placeholder: "https://hooks.nexus.com/trigger/...",
    description: "Requires webhook URL listener"
  },
  {
    key: "gmail_listener",
    name: "Gmail Listener",
    category: "Triggers",
    favicon: "https://svgl.app/library/gmail.svg",
    placeholder: "",
    description: "Requires Gmail Email & SMTP App Password"
  },
  {
    key: "stripe_api_key",
    name: "Stripe Event",
    category: "Triggers",
    favicon: "https://svgl.app/library/stripe.svg",
    placeholder: "whsec_...",
    description: "Requires Stripe webhook secret"
  },
  {
    key: "telegram_bot_token",
    name: "Telegram Bot",
    category: "Triggers",
    favicon: "https://svgl.app/library/telegram.svg",
    placeholder: "123456:ABC-DEF...",
    description: "Requires Telegram BotFather token"
  },
  {
    key: "slack_webhook",
    name: "Slack Event",
    category: "Triggers",
    favicon: "https://svgl.app/library/slack.svg",
    placeholder: "https://hooks.slack.com/services/...",
    description: "Requires Slack OAuth webhook URL"
  },
  {
    key: "github_api_key",
    name: "GitHub Webhook",
    category: "Triggers",
    favicon: "https://svgl.app/library/github_light.svg",
    placeholder: "ghp_...",
    description: "Requires GitHub authorization token"
  },
  // LLM PROVIDERS
  {
    key: "anthropic_api_key",
    name: "Anthropic Claude",
    category: "LLM Providers",
    favicon: "https://svgl.app/library/anthropic_black.svg",
    placeholder: "sk-ant-...",
    description: "Requires anthropic_api_key"
  },
  {
    key: "openai_api_key",
    name: "OpenAI GPT & o3",
    category: "LLM Providers",
    favicon: "https://svgl.app/library/openai.svg",
    placeholder: "sk-proj-...",
    description: "Requires openai_api_key"
  },
  {
    key: "gemini_api_key",
    name: "Google Gemini",
    category: "LLM Providers",
    favicon: "https://svgl.app/library/gemini.svg",
    placeholder: "AIzaSy...",
    description: "Requires gemini_api_key"
  },
  {
    key: "groq_api_key",
    name: "Groq LPU Engine",
    category: "LLM Providers",
    favicon: "https://svgl.app/library/groq.svg",
    placeholder: "gsk_...",
    description: "Requires groq_api_key"
  },
  {
    key: "deepseek_api_key",
    name: "DeepSeek R1 / V3",
    category: "LLM Providers",
    favicon: "https://svgl.app/library/deepseek.svg",
    placeholder: "ds-...",
    description: "Requires deepseek_api_key"
  },
  {
    key: "meta_llama_api_key",
    name: "Meta Llama 3.3",
    category: "LLM Providers",
    favicon: "https://svgl.app/library/meta.svg",
    placeholder: "Llama key...",
    description: "Requires meta_llama_api_key"
  },
  {
    key: "mistral_api_key",
    name: "Mistral Large 2",
    category: "LLM Providers",
    favicon: "https://svgl.app/library/mistral-ai_logo.svg",
    placeholder: "mistral-...",
    description: "Requires mistral_api_key"
  },
  {
    key: "cohere_api_key",
    name: "Cohere Command R+",
    category: "LLM Providers",
    favicon: "https://svgl.app/library/cohere.svg",
    placeholder: "coh_...",
    description: "Requires cohere_api_key"
  },
  // DEVELOPER TOOLS
  {
    key: "rest_api_client_token",
    name: "REST API Client",
    category: "Developer Tools",
    favicon: "https://svgl.app/library/postman.svg",
    placeholder: "Bearer token...",
    description: "Requires REST Authorization header"
  },
  {
    key: "tavily_api_key",
    name: "Tavily Search",
    category: "Developer Tools",
    favicon: "https://avatars.githubusercontent.com/u/127116773?s=200&v=4",
    placeholder: "tvly-...",
    description: "Requires tavily_api_key"
  },
  {
    key: "perplexity_api_key",
    name: "Perplexity AI",
    category: "Developer Tools",
    favicon: "https://svgl.app/library/perplexity.svg",
    placeholder: "pplx-...",
    description: "Requires perplexity_api_key"
  },
  {
    key: "wolfram_api_key",
    name: "Wolfram Alpha",
    category: "Developer Tools",
    favicon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/wolfram.svg",
    placeholder: "AppID...",
    description: "Requires Wolfram Alpha AppID"
  },
  // APPS & APIS
  {
    key: "slack_webhook",
    name: "Slack Bot",
    category: "Apps & APIs",
    favicon: "https://svgl.app/library/slack.svg",
    placeholder: "https://hooks.slack.com/services/...",
    description: "Requires Slack bot OAuth token"
  },
  {
    key: "github_api_key",
    name: "GitHub API",
    category: "Apps & APIs",
    favicon: "https://svgl.app/library/github_light.svg",
    placeholder: "ghp_...",
    description: "Requires GitHub developer token"
  },
  {
    key: "discord_webhook",
    name: "Discord Bot",
    category: "Apps & APIs",
    favicon: "https://svgl.app/library/discord.svg",
    placeholder: "https://discord.com/api/webhooks/...",
    description: "Requires Discord integration webhook"
  },
  {
    key: "notion_api_key",
    name: "Notion Sync",
    category: "Apps & APIs",
    favicon: "https://svgl.app/library/notion.svg",
    placeholder: "secret_...",
    description: "Requires Notion integration token"
  },
  {
    key: "airtable_api_key",
    name: "Airtable API",
    category: "Apps & APIs",
    favicon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/airtable.svg",
    placeholder: "pat...",
    description: "Requires Airtable developer API key"
  },
  {
    key: "hubspot_api_key",
    name: "HubSpot CRM",
    category: "Apps & APIs",
    favicon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/hubspot.svg",
    placeholder: "pat-na1-...",
    description: "Requires HubSpot API key"
  },
  {
    key: "linear_api_key",
    name: "Linear Sync",
    category: "Apps & APIs",
    favicon: "https://svgl.app/library/linear.svg",
    placeholder: "lin_api_...",
    description: "Requires Linear workspace key"
  },
  // DATABASES & MEMORY
  {
    key: "pinecone_api_key",
    name: "Pinecone Vector",
    category: "Databases & Memory",
    favicon: "https://avatars.githubusercontent.com/u/74384617?s=200&v=4",
    placeholder: "pc_...",
    description: "Requires Pinecone vector API key"
  },
  {
    key: "postgres_uri",
    name: "PostgreSQL",
    category: "Databases & Memory",
    favicon: "https://svgl.app/library/postgresql.svg",
    placeholder: "postgresql://user:pass@host:5432/db",
    description: "Requires Postgres URI connection string"
  },
  {
    key: "mongodb_uri",
    name: "MongoDB",
    category: "Databases & Memory",
    favicon: "https://svgl.app/library/mongodb-icon-light.svg",
    placeholder: "mongodb+srv://...",
    description: "Requires Mongo Atlas connection string"
  },
  {
    key: "redis_uri",
    name: "Redis Buffer",
    category: "Databases & Memory",
    favicon: "https://svgl.app/library/redis.svg",
    placeholder: "redis://default:pass@host:6379",
    description: "Requires Redis instance URI string"
  },
  {
    key: "supabase_api_key",
    name: "Supabase DB",
    category: "Databases & Memory",
    favicon: "https://svgl.app/library/supabase.svg",
    placeholder: "sb_anon_key...",
    description: "Requires Supabase DB anon key"
  },
  {
    key: "qdrant_api_key",
    name: "Qdrant Vector",
    category: "Databases & Memory",
    favicon: "https://svgl.app/library/qdrant-icon-light.svg",
    placeholder: "qdr_api_key...",
    description: "Requires Qdrant client API key"
  }
];

export default function KeysPage() {
  const context = useContext(DashboardContext);

  if (!context) {
    return null;
  }

  const { credentials, setCredentials, setUserProfile, token, API_BASE_URL } = context;

  const [keySearchQuery, setKeySearchQuery] = useState("");
  const [keyActiveCategory, setKeyActiveCategory] = useState<string>("All");
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolIntegration | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [gmailEmailValue, setGmailEmailValue] = useState("");
  const [gmailPasswordValue, setGmailPasswordValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Category tags definitions
  const keyCategories = ["All", "Triggers", "LLM Providers", "Developer Tools", "Apps & APIs", "Databases & Memory"];

  const handleOpenConnect = (tool: ToolIntegration) => {
    setActiveTool(tool);
    if (tool.key === "gmail_listener") {
      setGmailEmailValue(credentials["gmail_email"] || "");
      setGmailPasswordValue(credentials["gmail_app_password"] || "");
    } else {
      setApiKeyValue(credentials[tool.key] || "");
    }
    setConnectDialogOpen(true);
  };

  const handleSaveCredential = async () => {
    if (!activeTool) return;
    setIsLoading(true);

    const bodyPayload = activeTool.key === "gmail_listener"
      ? { gmail_email: gmailEmailValue, gmail_app_password: gmailPasswordValue }
      : { [activeTool.key]: apiKeyValue };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.api_credentials || {});
        setUserProfile((prev: any) => prev ? { ...prev, api_credentials: data.api_credentials } : prev);
        setConnectDialogOpen(false);
        setActiveTool(null);
        setApiKeyValue("");
        setGmailEmailValue("");
        setGmailPasswordValue("");
      }
    } catch (err) {
      console.error("Save credentials error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectCredential = async (keyName: string) => {
    setIsLoading(true);
    const bodyPayload = keyName === "gmail_listener"
      ? { gmail_email: "", gmail_app_password: "" }
      : { [keyName]: "" };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.api_credentials || {});
        setUserProfile((prev: any) => prev ? { ...prev, api_credentials: data.api_credentials } : prev);
      }
    } catch (err) {
      console.error("Disconnect credentials error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter keys based on search and category tab
  const filteredIntegrations = INTEGRATIONS.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(keySearchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(keySearchQuery.toLowerCase());
    const matchesCategory = keyActiveCategory === "All" || tool.category === keyActiveCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      key="keys"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title Segment */}
      <div>
        <h2 className="text-sm font-bold text-foreground">Secure Tool Credentials</h2>
        <p className="text-xs text-muted-foreground">Connect your custom API keys below. If connected, your keys will take first priority override over sandbox configurations.</p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={keySearchQuery}
            onChange={(e) => setKeySearchQuery(e.target.value)}
            placeholder="Search integrations, databases, webhooks..."
            className="pl-9 h-10 text-xs bg-card border-border rounded-md text-foreground focus-visible:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full sm:max-w-md">
          {keyCategories.map((cat) => {
            const isActive = keyActiveCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setKeyActiveCategory(cat)}
                className={`text-[10px] font-bold px-3 py-2 rounded-lg shrink-0 transition-colors border cursor-pointer ${
                  isActive
                    ? "bg-foreground text-background border-foreground shadow-2xs"
                    : "bg-card border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* PREMIUM INTEGRATIONS GRID LAYOUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredIntegrations.map((tool) => {
          const isConnected = tool.key === "gmail_listener"
            ? (!!credentials["gmail_email"] && !!credentials["gmail_app_password"])
            : !!credentials[tool.key];

          return (
            <div
              key={tool.key}
              className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-foreground/35 hover:shadow-sm transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
                    <img
                      src={tool.favicon}
                      alt={tool.name}
                      className="w-4 h-4 object-contain rounded"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  
                  {isConnected ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] uppercase tracking-wider font-mono px-1.5 py-0.5">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[8px] uppercase tracking-wider font-mono px-1.5 py-0.5">
                      Inactive
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-foreground block truncate">
                    {tool.name}
                  </span>
                  <p className="text-[10px] text-muted-foreground font-mono truncate leading-normal">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                <span className="text-[9px] uppercase font-mono text-muted-foreground">{tool.category.slice(0, 15)}</span>
                
                <div className="flex gap-1.5">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleOpenConnect(tool)}
                        className="text-[10px] font-bold px-2 py-1.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDisconnectCredential(tool.key)}
                        className="text-[10px] font-bold px-2 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/25 cursor-pointer transition-colors"
                      >
                        Wipe
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenConnect(tool)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded bg-foreground hover:bg-foreground/90 text-background cursor-pointer transition-colors"
                    >
                      Configure
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-12 text-center bg-card/30">
          <p className="text-xs text-muted-foreground font-medium">No matching integrations found.</p>
        </div>
      )}

      {/* Connection Dialog Modal */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        {activeTool && (
          <DialogContent className="max-w-md bg-background border border-border p-6 rounded-lg font-sans">
            <DialogHeader className="space-y-2 border-b border-border pb-4 mb-4">
              <DialogTitle className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <img
                  src={activeTool.favicon}
                  alt={activeTool.name}
                  className="w-5 h-5 object-contain"
                />
                Connect {activeTool.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter your custom {activeTool.name} credentials to prioritize user overrides.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {activeTool.key === "gmail_listener" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Gmail Email Address</Label>
                    <Input
                      type="email"
                      value={gmailEmailValue}
                      onChange={(e) => setGmailEmailValue(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">SMTP App Password</Label>
                    <Input
                      type="password"
                      value={gmailPasswordValue}
                      onChange={(e) => setGmailPasswordValue(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="h-9 text-xs"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">API Token / Secret Key</Label>
                  <Input
                    type="password"
                    value={apiKeyValue}
                    onChange={(e) => setApiKeyValue(e.target.value)}
                    placeholder={activeTool.placeholder}
                    className="h-9 text-xs"
                  />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground leading-normal">
                Credentials are encrypted and saved securely inside MongoDB. When executing LLM or Search tool nodes, these override variables will take priority.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConnectDialogOpen(false);
                  setActiveTool(null);
                  setApiKeyValue("");
                  setGmailEmailValue("");
                  setGmailPasswordValue("");
                }}
                className="h-9 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCredential}
                className="h-9 bg-foreground text-background hover:bg-foreground/90 text-xs font-bold px-4"
              >
                Save Connection
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
}
