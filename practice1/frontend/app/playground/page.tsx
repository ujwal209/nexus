"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import {
  FiCpu,
  FiPlay,
  FiRotateCcw,
  FiPlus,
  FiCloud,
  FiZap,
  FiGlobe,
  FiDatabase,
  FiServer,
  FiTerminal,
  FiTrash2,
  FiSliders,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiCode,
  FiCopy,
  FiCheck,
  FiX,
  FiSearch,
  FiMail,
  FiClock,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiScissors,
  FiEdit3,
  FiKey,
  FiActivity,
  FiLayers,
  FiShield,
  FiSettings,
  FiBarChart2,
  FiGitBranch,
  FiGrid,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { saveWorkflowToBackend, connectExecutionWebSocket } from "@/lib/api";

// ROBUST BRAND LOGO WITH FAILSAFE FALLBACK
function BrandLogo({ url, name }: { url: string; name: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (hasError || !url) {
    return (
      <div className="w-full h-full rounded bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground border border-border">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      onError={() => setHasError(true)}
      className="w-full h-full object-contain pointer-events-none"
    />
  );
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

interface CanvasNode {
  id: string;
  type: "trigger" | "llm" | "tool" | "memory" | "database" | "app";
  title: string;
  subtitle: string;
  status: "idle" | "running" | "success";
  x: number;
  y: number;
  isCollapsed?: boolean;
  isConfigured?: boolean;
  output?: any;
  iconUrl: string;
  colorClass: string;
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
  };
}

const LLM_PROVIDERS = [
  {
    id: "anthropic",
    name: "Anthropic",
    logoUrl: "https://svgl.app/library/anthropic_black.svg",
    colorClass: "bg-amber-600",
    models: [
      { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", desc: "Hybrid Reasoning & High-Speed Synthesis", badge: "NEW 3.7" },
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet v2", desc: "State-of-the-art Coding & Complex Reasoning" },
      { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku", desc: "Sub-100ms Ultra Fast Execution" },
      { id: "claude-3-opus", name: "Claude 3 Opus", desc: "Deep Knowledge & Analysis Frontier" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    logoUrl: "https://svgl.app/library/openai.svg",
    colorClass: "bg-emerald-600",
    models: [
      { id: "gpt-4o", name: "GPT-4o Multimodal", desc: "Omni Audio, Vision & Text Model" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Lightweight High Speed Multimodal" },
      { id: "o3-mini", name: "OpenAI o3-mini", desc: "High-Efficiency STEM & Code Reasoning", badge: "REASONING" },
      { id: "o1", name: "OpenAI o1", desc: "Frontier Math & Deep Reasoning" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", desc: "128k Context Production Model" },
    ],
  },
  {
    id: "google",
    name: "Google Gemini",
    logoUrl: "https://svgl.app/library/gemini.svg",
    colorClass: "bg-sky-600",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", desc: "Next-gen Multimodal Realtime Engine", badge: "FLASH 2.0" },
      { id: "gemini-2.0-flash-thinking", name: "Gemini 2.0 Flash Thinking", desc: "Realtime Chain-of-Thought Reasoning", badge: "THINKING" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", desc: "2 Million Token Massive Context" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", desc: "High Velocity Production Engine" },
    ],
  },
  {
    id: "groq",
    name: "Groq LPU",
    logoUrl: "https://svgl.app/library/groq.svg",
    colorClass: "bg-orange-600",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", desc: "500+ Tokens/sec LPU Inference", badge: "500 TPS" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B", desc: "Ultra-fast Distilled Reasoning on Groq", badge: "GROQ LPU" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B MoE", desc: "Fast Sparse Mixture-of-Experts" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B IT", desc: "High-speed Google Gemma on Groq" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek AI",
    logoUrl: "https://svgl.app/library/deepseek.svg",
    colorClass: "bg-blue-600",
    models: [
      { id: "deepseek-r1", name: "DeepSeek R1", desc: "Open-weights Frontier Reasoning Engine", badge: "REASONING" },
      { id: "deepseek-v3", name: "DeepSeek V3", desc: "671B Parameter MoE General Engine" },
      { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", desc: "Specialized 338+ Language Code Model" },
    ],
  },
  {
    id: "meta",
    name: "Meta Llama",
    logoUrl: "https://svgl.app/library/meta.svg",
    colorClass: "bg-blue-700",
    models: [
      { id: "llama-3.3-70b-instruct", name: "Llama 3.3 70B Instruct", desc: "SOTA Open Source 70B Instruct" },
      { id: "llama-3.1-405b-instruct", name: "Llama 3.1 405B Frontier", desc: "Massive 405B Parameter Frontier Model" },
      { id: "llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct", desc: "Fast Edge & On-Device Model" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    logoUrl: "https://svgl.app/library/mistral-ai_logo.svg",
    colorClass: "bg-amber-700",
    models: [
      { id: "mistral-large-2411", name: "Mistral Large 2", desc: "128k Context Multilingual Reasoning" },
      { id: "codestral-2501", name: "Codestral 2501", desc: "Specialized Software Engineering LLM" },
      { id: "pixtral-12b", name: "Pixtral 12B Multimodal", desc: "Vision & Document Understanding" },
      { id: "mistral-nemo", name: "Mistral NeMo 12B", desc: "NVIDIA Co-Developed High-Efficiency Engine" },
    ],
  },
  {
    id: "cohere",
    name: "Cohere",
    logoUrl: "https://svgl.app/library/cohere.svg",
    colorClass: "bg-teal-700",
    models: [
      { id: "command-r-plus", name: "Command R+", desc: "Enterprise RAG & Tool Calling Leader" },
      { id: "command-r", name: "Command R", desc: "128k Multilingual RAG Model" },
    ],
  },
];

interface PaletteNodeDef {
  type: "trigger" | "llm" | "tool" | "memory" | "database" | "app";
  title: string;
  subtitle: string;
  category: "Triggers" | "LLM Providers" | "Developer Tools" | "Apps & APIs" | "Databases & Memory";
  iconUrl: string;
  colorClass: string;
  providerId?: string;
}

export default function PlaygroundPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // CANVAS CONTAINER REF
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // DYNAMIC CANVAS ZOOM & PAN STATE
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const isDeletingRef = useRef(false);

  // MOBILE SIDEBAR DIALOG
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);

  // BOX SELECTION STATE (RUBBERBAND MARQUEE)
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const isBoxSelectingRef = useRef(false);

  // INTERACTIVE CONNECT WIRE & PLUS ICON POPOVER STATE
  const [connectingStartNodeId, setConnectingStartNodeId] = useState<string | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);
  const [quickConnectNodeId, setQuickConnectNodeId] = useState<string | null>(null);

  const handleConnectNodes = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    if (connections.some((c) => c.fromId === fromId && c.toId === toId)) return;
    setConnections((prev) => [...prev, { id: `c-${Date.now()}`, fromId, toId }]);
    setConnectingStartNodeId(null);
    setConnectingMousePos(null);
    setQuickConnectNodeId(null);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(["llm-1"]);
  
  // DRAG STATE FOR SMOOTH 60FPS DRAGGING
  const draggingNodeRef = useRef<{ id: string; startMouseX: number; startMouseY: number; initialPositions: { [key: string]: { x: number; y: number } } } | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [graphName, setGraphName] = useState("nexus_agent_pipeline_v1");
  const [jsonExportOpen, setJsonExportOpen] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [nodePropsDialogOpen, setNodePropsDialogOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"params" | "prompt" | "performance" | "guardrails">("params");
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [restTab, setRestTab] = useState<"headers" | "body" | "auth" | "query">("headers");
  const [restMethodDropdownOpen, setRestMethodDropdownOpen] = useState(false);

  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  // DARK MODE STATE
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("nexus-theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Make login optional for playground
    const token = localStorage.getItem("nexus-token");
    if (!token) {
      setAuthLoading(false);
      return;
    }

    const checkAuthStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();

        if (!data.is_verified) {
          localStorage.setItem("nexus-verify-email", data.email);
          router.push("/verify-email");
          return;
        }

        if (!data.onboarded) {
          router.push("/onboarding");
          return;
        }

        setAuthLoading(false);
      } catch (err) {
        // Clear corrupt session and allow local playground access
        localStorage.removeItem("nexus-token");
        localStorage.removeItem("nexus-email");
        setAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("nexus-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // EXECUTION OUTPUT MODAL & EXPORT STATE
  const [outputModalOpen, setOutputModalOpen] = useState(false);
  const [selectedOutputNode, setSelectedOutputNode] = useState<CanvasNode | null>(null);
  const [outputModalTab, setOutputModalTab] = useState<"overview" | "sources" | "json" | "audit">("overview");
  const [exportCopied, setExportCopied] = useState(false);

  // RIGHT CLICK CONTEXT MENU STATE
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string;
  }>({ visible: false, x: 0, y: 0, nodeId: "" });

  const [nodes, setNodes] = useState<CanvasNode[]>([
    {
      id: "trigger-1",
      type: "trigger",
      title: "Webhook Trigger",
      subtitle: "HTTP Event Listener",
      status: "idle",
      x: 40,
      y: 120,
      isCollapsed: false,
      iconUrl: "https://svgl.app/library/postman.svg",
      colorClass: "bg-red-600",
      config: { webhookUrl: "/api/v1/webhooks/trigger-1" },
    },
    {
      id: "tool-1",
      type: "tool",
      title: "Tavily Web Search",
      subtitle: "Live AI Research",
      status: "idle",
      x: 380,
      y: 60,
      isCollapsed: false,
      iconUrl: "https://avatars.githubusercontent.com/u/127116773?s=200&v=4",
      colorClass: "bg-blue-600",
      config: { searchDepth: "advanced", maxResults: 5, timeout: 30 },
    },
    {
      id: "memory-1",
      type: "memory",
      title: "Pinecone Vector",
      subtitle: "RAG Semantic Store",
      status: "idle",
      x: 380,
      y: 260,
      isCollapsed: false,
      iconUrl: "https://avatars.githubusercontent.com/u/74384617?s=200&v=4",
      colorClass: "bg-emerald-600",
      config: { topK: 10, query: "MATCH_EMBEDDINGS" },
    },
    {
      id: "llm-1",
      type: "llm",
      title: "Claude 3.5 Sonnet",
      subtitle: "Anthropic Agent Engine",
      status: "idle",
      x: 720,
      y: 140,
      isCollapsed: false,
      iconUrl: "https://svgl.app/library/anthropic_black.svg",
      colorClass: "bg-amber-600",
      config: {
        model: "claude-3-5-sonnet",
        fallbackModel: "gpt-4o",
        temperature: 0.2,
        topP: 0.95,
        freqPenalty: 0.0,
        presPenalty: 0.0,
        maxTokens: 4096,
        responseFormat: "json_object",
        retryStrategy: "exponential",
        maxRetries: 3,
        cacheEnabled: true,
        memoryLimit: 512,
        concurrency: 10,
        priority: "high",
        jsonGuardrail: "pydantic_schema_v2",
        systemPrompt: "You are an autonomous AI research synthesizer. Process raw context from upstream tools, extract key verified insights, and format structured executive bullet points with high precision.",
      },
    },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: "c1", fromId: "trigger-1", toId: "tool-1" },
    { id: "c2", fromId: "trigger-1", toId: "memory-1" },
    { id: "c3", fromId: "tool-1", toId: "llm-1" },
    { id: "c4", fromId: "memory-1", toId: "llm-1" },
  ]);

  // RICH 40+ SHADCN-FIRST TOOL CATALOG
  const paletteCatalog: PaletteNodeDef[] = [
    // Triggers
    { type: "trigger", title: "Webhook Trigger", subtitle: "HTTP Event Endpoint", category: "Triggers", iconUrl: "https://svgl.app/library/postman.svg", colorClass: "" },
    { type: "trigger", title: "Cron Schedule", subtitle: "Interval Scheduler", category: "Triggers", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/clockify.svg", colorClass: "" },
    { type: "trigger", title: "Gmail Listener", subtitle: "New Email Trigger", category: "Triggers", iconUrl: "https://svgl.app/library/gmail.svg", colorClass: "" },
    { type: "trigger", title: "Stripe Event", subtitle: "Payment Trigger", category: "Triggers", iconUrl: "https://svgl.app/library/stripe.svg", colorClass: "" },
    { type: "trigger", title: "Telegram Bot", subtitle: "Incoming Message", category: "Triggers", iconUrl: "https://svgl.app/library/telegram.svg", colorClass: "" },
    { type: "trigger", title: "Slack Event", subtitle: "Message Mention", category: "Triggers", iconUrl: "https://svgl.app/library/slack.svg", colorClass: "" },
    { type: "trigger", title: "GitHub Webhook", subtitle: "Push & PR Events", category: "Triggers", iconUrl: "https://svgl.app/library/github_light.svg", colorClass: "" },

    // LLM Providers
    { type: "llm", title: "Anthropic Claude", subtitle: "Claude 3.7 & 3.5 Sonnet", category: "LLM Providers", iconUrl: "https://svgl.app/library/anthropic_black.svg", colorClass: "" },
    { type: "llm", title: "OpenAI GPT & o3", subtitle: "GPT-4o & o3-mini", category: "LLM Providers", iconUrl: "https://svgl.app/library/openai.svg", colorClass: "" },
    { type: "llm", title: "Google Gemini", subtitle: "Gemini 2.0 & 1.5 Pro", category: "LLM Providers", iconUrl: "https://svgl.app/library/gemini.svg", colorClass: "" },
    { type: "llm", title: "Groq LPU Engine", subtitle: "500+ TPS Llama & DeepSeek", category: "LLM Providers", iconUrl: "https://svgl.app/library/groq.svg", colorClass: "" },
    { type: "llm", title: "DeepSeek R1 / V3", subtitle: "Reasoning & MoE Engine", category: "LLM Providers", iconUrl: "https://svgl.app/library/deepseek.svg", colorClass: "" },
    { type: "llm", title: "Meta Llama 3.3", subtitle: "70B & 405B Instruct", category: "LLM Providers", iconUrl: "https://svgl.app/library/meta.svg", colorClass: "" },
    { type: "llm", title: "Mistral Large 2", subtitle: "128k Codestral & NeMo", category: "LLM Providers", iconUrl: "https://svgl.app/library/mistral-ai_logo.svg", colorClass: "" },
    { type: "llm", title: "Cohere Command R+", subtitle: "Enterprise RAG Leader", category: "LLM Providers", iconUrl: "https://svgl.app/library/cohere.svg", colorClass: "" },

    // Developer Tools
    { type: "tool", title: "REST API Client", subtitle: "HTTP Webhook Requests", category: "Developer Tools", iconUrl: "https://svgl.app/library/postman.svg", colorClass: "" },
    { type: "tool", title: "Tavily Search", subtitle: "Web Research Tool", category: "Developer Tools", iconUrl: "https://avatars.githubusercontent.com/u/127116773?s=200&v=4", colorClass: "" },
    { type: "tool", title: "Python Sandbox", subtitle: "gVisor MicroVM", category: "Developer Tools", iconUrl: "https://svgl.app/library/python.svg", colorClass: "" },
    { type: "tool", title: "JavaScript VM", subtitle: "Node.js Runner", category: "Developer Tools", iconUrl: "https://svgl.app/library/javascript.svg", colorClass: "" },
    { type: "tool", title: "Docker Executor", subtitle: "Container Task", category: "Developer Tools", iconUrl: "https://svgl.app/library/docker.svg", colorClass: "" },
    { type: "tool", title: "Perplexity AI", subtitle: "Factual Search", category: "Developer Tools", iconUrl: "https://svgl.app/library/perplexity.svg", colorClass: "" },
    { type: "tool", title: "Wolfram Alpha", subtitle: "Math & Computations", category: "Developer Tools", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/wolfram.svg", colorClass: "" },

    // Apps & APIs
    { type: "app", title: "Slack Bot", subtitle: "Channel Alert", category: "Apps & APIs", iconUrl: "https://svgl.app/library/slack.svg", colorClass: "" },
    { type: "app", title: "GitHub API", subtitle: "PR Audit Runner", category: "Apps & APIs", iconUrl: "https://svgl.app/library/github_light.svg", colorClass: "" },
    { type: "app", title: "Discord Bot", subtitle: "Community Messages", category: "Apps & APIs", iconUrl: "https://svgl.app/library/discord.svg", colorClass: "" },
    { type: "app", title: "Notion Sync", subtitle: "Workspace Pages", category: "Apps & APIs", iconUrl: "https://svgl.app/library/notion.svg", colorClass: "" },
    { type: "app", title: "Airtable API", subtitle: "Relational Records", category: "Apps & APIs", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/airtable.svg", colorClass: "" },
    { type: "app", title: "HubSpot CRM", subtitle: "Lead Workflows", category: "Apps & APIs", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/hubspot.svg", colorClass: "" },
    { type: "app", title: "Linear Sync", subtitle: "Issue Tracker", category: "Apps & APIs", iconUrl: "https://svgl.app/library/linear.svg", colorClass: "" },

    // Databases & Memory
    { type: "memory", title: "Pinecone Vector", subtitle: "RAG Embeddings", category: "Databases & Memory", iconUrl: "https://avatars.githubusercontent.com/u/74384617?s=200&v=4", colorClass: "" },
    { type: "database", title: "PostgreSQL", subtitle: "Relational SQL", category: "Databases & Memory", iconUrl: "https://svgl.app/library/postgresql.svg", colorClass: "" },
    { type: "database", title: "MongoDB", subtitle: "NoSQL Database", category: "Databases & Memory", iconUrl: "https://svgl.app/library/mongodb-icon-light.svg", colorClass: "" },
    { type: "database", title: "Redis Buffer", subtitle: "In-Memory Store", category: "Databases & Memory", iconUrl: "https://svgl.app/library/redis.svg", colorClass: "" },
    { type: "database", title: "Supabase DB", subtitle: "Postgres + Realtime", category: "Databases & Memory", iconUrl: "https://svgl.app/library/supabase.svg", colorClass: "" },
    { type: "memory", title: "Qdrant Vector", subtitle: "High Performance RAG", category: "Databases & Memory", iconUrl: "https://svgl.app/library/qdrant-icon-light.svg", colorClass: "" },
  ];

  const categoryTabs = ["All", "LLM Providers", "Triggers", "Developer Tools", "Apps & APIs", "Databases & Memory"];

  const filteredCatalog = paletteCatalog.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // NON-PASSIVE CANVAS-ONLY WHEEL ZOOM
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleCanvasWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoomLevel((prev) => Math.min(2.0, Math.max(0.4, prev * zoomFactor)));
    };

    container.addEventListener("wheel", handleCanvasWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleCanvasWheel);
    };
  }, []);

  // CANVAS PANNING OR RUBBERBAND MARQUEE SELECTION
  const handleMainPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || (e.ctrlKey && e.button === 0)) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    } else if (e.button === 0) {
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const canvasX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const canvasY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      
      isBoxSelectingRef.current = true;
      setSelectionBox({ x1: canvasX, y1: canvasY, x2: canvasX, y2: canvasY });
      if (!e.shiftKey) {
        setSelectedNodeIds([]);
      }
    }
  };

  const handleMainPointerMove = (e: React.PointerEvent) => {
    if (connectingStartNodeId) {
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const canvasX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
        const canvasY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
        setConnectingMousePos({ x: canvasX, y: canvasY });
      }
    }

    if (isPanningRef.current) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    } else if (isBoxSelectingRef.current && selectionBox) {
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const canvasX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const canvasY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

      setSelectionBox((prev) => (prev ? { ...prev, x2: canvasX, y2: canvasY } : null));

      const minX = Math.min(selectionBox.x1, canvasX);
      const maxX = Math.max(selectionBox.x1, canvasX);
      const minY = Math.min(selectionBox.y1, canvasY);
      const maxY = Math.max(selectionBox.y1, canvasY);

      const hitNodes = nodes
        .filter((n) => n.x + 245 >= minX && n.x <= maxX && n.y + 100 >= minY && n.y <= maxY)
        .map((n) => n.id);

      setSelectedNodeIds(hitNodes);
    }
  };

  const handleMainPointerUp = () => {
    isPanningRef.current = false;
    isBoxSelectingRef.current = false;
    setSelectionBox(null);
  };

  // NODE DRAGGING ENGINE
  const handlePointerDownNode = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      if (selectedNodeIds.includes(id)) {
        setSelectedNodeIds((prev) => prev.filter((item) => item !== id));
      } else {
        setSelectedNodeIds((prev) => [...prev, id]);
      }
    } else if (!selectedNodeIds.includes(id)) {
      setSelectedNodeIds([id]);
    }

    const currentSelected = selectedNodeIds.includes(id) ? selectedNodeIds : [id];
    const initialPosMap: { [key: string]: { x: number; y: number } } = {};
    nodes.forEach((n) => {
      if (currentSelected.includes(n.id)) {
        initialPosMap[n.id] = { x: n.x, y: n.y };
      }
    });

    draggingNodeRef.current = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      initialPositions: initialPosMap,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingNodeRef.current) return;
      const { startMouseX, startMouseY, initialPositions } = draggingNodeRef.current;
      
      const dx = (e.clientX - startMouseX) / zoomLevel;
      const dy = (e.clientY - startMouseY) / zoomLevel;

      setNodes((prev) =>
        prev.map((n) => {
          if (initialPositions[n.id]) {
            const newX = Math.max(10, Math.min(2400, initialPositions[n.id].x + dx));
            const newY = Math.max(10, Math.min(1800, initialPositions[n.id].y + dy));
            return { ...n, x: newX, y: newY };
          }
          return n;
        })
      );
    };

    const handlePointerUp = () => {
      draggingNodeRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [zoomLevel]);

  // Toggle Collapse on node card
  const toggleNodeCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isCollapsed: !n.isCollapsed } : n))
    );
  };

  // Add node to canvas
  const handleAddNode = (item: PaletteNodeDef) => {
    const newId = `${item.type}-${Date.now()}`;
    const defaultProvider = item.providerId || (item.title.toLowerCase().includes("openai") ? "openai" : item.title.toLowerCase().includes("gemini") ? "google" : item.title.toLowerCase().includes("groq") ? "groq" : item.title.toLowerCase().includes("deepseek") ? "deepseek" : item.title.toLowerCase().includes("llama") || item.title.toLowerCase().includes("meta") ? "meta" : item.title.toLowerCase().includes("mistral") ? "mistral" : item.title.toLowerCase().includes("cohere") ? "cohere" : "anthropic");
    const provObj = LLM_PROVIDERS.find((p) => p.id === defaultProvider) || LLM_PROVIDERS[0];
    const defaultModel = provObj.models[0].id;

    const newNode: CanvasNode = {
      id: newId,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      status: "idle",
      x: 200 + (nodes.length % 3) * 30,
      y: 100 + (nodes.length % 3) * 30,
      isCollapsed: false,
      iconUrl: item.iconUrl,
      colorClass: item.colorClass,
      config: {
        provider: defaultProvider,
        model: defaultModel,
        method: "GET",
        url: (item.title.toLowerCase().includes("rest") || item.title.toLowerCase().includes("webhook") || item.title.toLowerCase().includes("http") || item.title.toLowerCase().includes("api"))
          ? "https://jsonplaceholder.typicode.com/posts/1" 
          : "",
        temperature: 0.2,
        topP: 0.95,
        fallbackModel: "gpt-4o",
        maxTokens: 4096,
        retryStrategy: "exponential",
        maxRetries: 3,
        memoryLimit: 512,
        concurrency: 10,
        priority: "high",
        topK: 5,
        systemPrompt: "You are an autonomous AI research synthesizer. Process raw context from upstream tools, extract key verified insights, and format structured executive bullet points with high precision.",
      },
    };

    setNodes((prev) => [...prev, newNode]);

    if (nodes.some((n) => n.id === "llm-1")) {
      setConnections((prev) => [
        ...prev,
        { id: `conn-${Date.now()}`, fromId: newId, toId: "llm-1" },
      ]);
    }

    setSelectedNodeIds([newId]);
    setMobileCatalogOpen(false);
  };

  // Delete selected nodes
  const handleDeleteSelected = () => {
    const targets = selectedNodeIds.length > 0 ? selectedNodeIds : contextMenu.nodeId ? [contextMenu.nodeId] : [];
    if (targets.length === 0) return;
    isDeletingRef.current = true;
    setNodes((prev) => prev.filter((n) => !targets.includes(n.id)));
    setConnections((prev) => prev.filter((c) => !targets.includes(c.fromId) && !targets.includes(c.toId)));
    setSelectedNodeIds([]);
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: "" });
    setNodePropsDialogOpen(false);
  };

  const handleDeleteSelectedNodes = handleDeleteSelected;

  // Single delete
  const handleDeleteNode = (id: string) => {
    isDeletingRef.current = true;
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.fromId !== id && c.toId !== id));
    setSelectedNodeIds((prev) => prev.filter((item) => item !== id));
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: "" });
    setNodePropsDialogOpen(false);
  };

  // Duplicate selected nodes
  const handleDuplicateSelected = () => {
    const targets = selectedNodeIds.length > 0 ? selectedNodeIds : contextMenu.nodeId ? [contextMenu.nodeId] : [];
    const newDups: CanvasNode[] = [];
    const newDupIds: string[] = [];

    nodes.forEach((n) => {
      if (targets.includes(n.id)) {
        const dupId = `${n.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        newDupIds.push(dupId);
        newDups.push({
          ...n,
          id: dupId,
          title: `${n.title} (Copy)`,
          x: n.x + 30,
          y: n.y + 30,
        });
      }
    });

    setNodes((prev) => [...prev, ...newDups]);
    setSelectedNodeIds(newDupIds);
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: "" });
  };

  // Disconnect selected nodes
  const handleDisconnectSelected = () => {
    const targets = selectedNodeIds.length > 0 ? selectedNodeIds : contextMenu.nodeId ? [contextMenu.nodeId] : [];
    setConnections((prev) => prev.filter((c) => !targets.includes(c.fromId) && !targets.includes(c.toId)));
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: "" });
  };

  // Delink single connection
  const handleDelinkConnection = (connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
  };

  // Handle right-click on node card
  const handleNodeContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedNodeIds.includes(id)) {
      setSelectedNodeIds([id]);
    }
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      nodeId: id,
    });
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState("SAVED");

  // Save Workflow AST to MongoDB Atlas API or local storage
  const handleSaveWorkflow = async () => {
    setIsSaving(true);
    const payload = {
      graph_id: graphName,
      name: graphName,
      engine: "nexus_agent_v2",
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        subtitle: n.subtitle,
        config: n.config,
        position: { x: Math.round(n.x), y: Math.round(n.y) },
      })),
      edges: connections,
    };

    const token = localStorage.getItem("nexus-token");
    if (!token) {
      localStorage.setItem(`nexus-local-graph-${graphName}`, JSON.stringify(payload));
      setIsSaving(false);
      setSaveStatusText("SAVED LOCALLY");
      setTimeout(() => setSaveStatusText("SAVED"), 3000);
      return;
    }

    const res = await saveWorkflowToBackend(payload);
    setIsSaving(false);
    if (res) {
      setSaveStatusText("SAVED TO MONGO");
      setTimeout(() => setSaveStatusText("SAVED"), 3000);
    }
  };

  // Run Flow via WebSocket Engine API
  const runSimulation = async () => {
    if (isRunning) return;

    // Validate REST nodes have URLs
    const invalidRESTNode = nodes.find((n) => {
      const isREST = n.type !== "trigger" && 
        (n.title.toLowerCase().includes("rest") || 
         n.title.toLowerCase().includes("webhook") || 
         n.title.toLowerCase().includes("http") ||
         n.title.toLowerCase().includes("api call") ||
         n.title.toLowerCase().includes("api client"));
      const isUrlEmpty = isREST && !(n.config.url || "").trim();
      return isUrlEmpty;
    });

    if (invalidRESTNode) {
      alert(`Validation Error: Please configure the Request URL for "${invalidRESTNode.title}" before running the test.`);
      return;
    }

    setIsRunning(true);

    // Save AST before triggering execution
    await handleSaveWorkflow();

    // Reset node statuses to idle
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle" })));

    // Connect to WebSocket API Engine
    const socket = connectExecutionWebSocket(
      graphName,
      (nodeId, status, output) => {
        console.log(`[CANVAS] Node update: ${nodeId} → ${status}`, output);
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId ? { ...n, status: status as any, output: output ?? n.output } : n
          )
        );
      },
      () => {
        setIsRunning(false);
      },
      (err) => {
        const errMsg = typeof err === "string" ? err : (err?.message || "Backend server is offline or returned an error.");
        console.error("[CANVAS] WebSocket error:", errMsg, err);
        setNodes((prev) =>
          prev.map((n) => ({
            ...n,
            status: "error" as any,
            output: {
              error: true,
              message: errMsg,
              execution_audit: {
                execution_mode: "CONNECTION_ERROR",
                logs: [
                  `[${new Date().toISOString().slice(11, 19)}] ERROR: ${errMsg}`,
                  `[${new Date().toISOString().slice(11, 19)}] ACTION: Make sure the backend is running: uv run uvicorn main:app --reload --port 8000`,
                ]
              }
            },
          }))
        );
        setIsRunning(false);
      }
    );
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle" })));
  };

  const primarySelectedNode = nodes.find((n) => n.id === selectedNodeIds[0]);

  const graphJson = JSON.stringify(
    {
      graph_id: graphName,
      engine: "nexus_agent_v2",
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        config: n.config,
        position: { x: Math.round(n.x), y: Math.round(n.y) },
      })),
      edges: connections,
    },
    null,
    2
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(graphJson);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex flex-col items-center justify-center font-sans relative">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
        <div className="flex flex-col items-center gap-4 z-10 text-center">
          <span className="text-sm font-extrabold tracking-tight text-foreground">
            NEXUS <span className="text-primary font-light">STUDIO</span>
          </span>
          <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground animate-pulse mt-1">
            Authenticating Session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setContextMenu({ visible: false, x: 0, y: 0, nodeId: "" })}
      className="h-screen w-screen bg-background text-foreground flex flex-col font-sans overflow-hidden select-none"
    >
      
      {/* 1. SHADCN-FIRST HEADER NAVBAR */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between z-30 shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-8 rounded-md border border-border px-2">
            <Link href="/" title="Back to Home">
              <span>Back</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2 border-r border-border pr-3">
            <Input
              value={graphName}
              onChange={(e) => setGraphName(e.target.value)}
              className="h-8 font-semibold text-sm bg-transparent border-none focus-visible:ring-0 w-36 sm:w-56 font-sans px-1 text-foreground"
            />
            <button
              onClick={handleSaveWorkflow}
              className="cursor-pointer"
              title="Save state"
            >
              <span className="text-[10px] font-medium border border-border px-2 py-0.5 rounded text-muted-foreground">
                {isSaving ? "Saving..." : "Saved"}
              </span>
            </button>
          </div>

          <Button size="sm" variant="ghost" onClick={resetSimulation} className="hidden sm:flex h-8 text-xs font-medium rounded-md">
            <span>Reset Canvas</span>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleTheme}
            className="h-8 rounded-md border border-border text-xs font-medium cursor-pointer"
          >
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveWorkflow}
            disabled={isSaving}
            className="hidden sm:flex h-8 rounded-md border border-border text-xs font-medium cursor-pointer"
          >
            <span>Save Flow</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setJsonExportOpen(true)}
            className="hidden sm:flex h-8 rounded-md border border-border text-xs font-medium cursor-pointer"
          >
            <span>Export AST</span>
          </Button>

          <Button
            size="sm"
            onClick={runSimulation}
            disabled={isRunning}
            className="h-8 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium text-xs px-4 cursor-pointer"
          >
            <span>{isRunning ? "Running..." : "Test Flow"}</span>
          </Button>
        </div>
      </header>

      {/* 2. MAIN BUILDER BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SHADCN-FIRST DESKTOP SIDEBAR PANEL (40+ TOOLS) */}
        <aside
          className={`hidden md:flex ${
            isSidebarCollapsed ? "w-16 p-2" : "w-80 p-4"
          } border-r border-border/80 bg-card flex-col gap-4 shrink-0 z-20 transition-all duration-300 overflow-y-auto custom-thin-scrollbar`}
        >
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between w-full pr-2">
                <h3 className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                  Node Catalog ({filteredCatalog.length})
                </h3>
                <Badge variant="outline" className="text-[9px] font-mono bg-primary/10 text-primary border-primary/20">
                  NEXUS Studio
                </Badge>
              </div>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground shrink-0 ml-auto cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {!isSidebarCollapsed ? (
            <>
              {/* STICKY SEARCH BAR */}
              <div className="sticky top-0 bg-card z-30 pt-1 pb-3 border-b border-border/40 space-y-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search 40+ tools, LLMs & APIs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-8 h-8.5 text-xs bg-muted/40 border-border/80 rounded-xl shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <FiX className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-thin-scrollbar">
                  {categoryTabs.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* CATEGORIZED GRID TILES */}
              <div className="space-y-5">
                {categoryTabs.filter(c => c !== "All").map((cat) => {
                  if (activeCategory !== "All" && activeCategory !== cat) return null;
                  const catItems = filteredCatalog.filter((item) => item.category === cat);
                  if (catItems.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest block px-1">
                        {cat} ({catItems.length})
                      </span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {catItems.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAddNode(item)}
                            className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/60 hover:border-primary/40 transition-all text-left cursor-pointer shadow-2xs group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-muted/80 border border-border/60 flex items-center justify-center p-1.5 mb-2 group-hover:scale-110 transition-transform overflow-hidden">
                              <BrandLogo url={item.iconUrl} name={item.title} />
                            </div>
                            <span className="font-bold text-xs text-foreground truncate w-full leading-tight">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground truncate w-full mt-0.5">{item.subtitle}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* COLLAPSED ICON-ONLY TOOLBAR */
            <div className="flex flex-col items-center gap-3 pt-2">
              {paletteCatalog.slice(0, 10).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddNode(item)}
                  title={`Add ${item.title}`}
                  className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center p-2 hover:bg-muted hover:border-primary transition-all cursor-pointer shadow-2xs"
                >
                  <BrandLogo url={item.iconUrl} name={item.title} />
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* FULL-WIDTH RESPONSIVE CANVAS */}
        <main
          ref={canvasContainerRef}
          onPointerDown={handleMainPointerDown}
          onPointerMove={handleMainPointerMove}
          onPointerUp={handleMainPointerUp}
          className="flex-1 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] bg-background relative overflow-hidden p-3 sm:p-6 z-10 flex flex-col justify-between cursor-crosshair touch-none"
        >
          
          {/* FLOATING MULTI-SELECTION TOOLBAR */}
          <AnimatePresence>
            {selectedNodeIds.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-6 z-40 bg-background border border-border rounded-md shadow-md p-2 flex items-center gap-2 max-w-[90vw] overflow-x-auto font-sans"
              >
                <span className="text-xs font-medium text-muted-foreground px-1.5 py-0.5 border border-border rounded">
                  {selectedNodeIds.length} Selected
                </span>

                <div className="h-4 w-px bg-border shrink-0" />

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDuplicateSelected}
                  className="h-7 text-xs font-medium rounded-sm cursor-pointer shrink-0"
                >
                  Duplicate
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDeleteSelectedNodes}
                  className="h-7 text-xs font-medium text-destructive hover:text-destructive rounded-sm cursor-pointer shrink-0"
                >
                  Delete
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FLOATING CANVAS ZOOM CONTROLS */}
          <div className="absolute right-3 top-3 sm:right-6 sm:top-6 z-30 flex items-center gap-1.5 bg-background border border-border p-1 rounded-md shadow-md font-sans">
            <Button variant="ghost" size="icon" onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.1))} className="h-7 w-7 rounded-sm text-xs font-semibold">
              +
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.1))} className="h-7 w-7 rounded-sm text-xs font-semibold">
              -
            </Button>
            
            <div className="h-4 w-px bg-border" />

            <button
              onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
              className="text-[10px] font-medium text-foreground hover:underline px-1"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
          </div>

          {/* TRANSFORMED INNER CANVAS GRAPH CONTAINER */}
          <div
            style={{
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
              transformOrigin: "0 0",
            }}
            className="w-full h-full absolute inset-0 transition-transform duration-75"
          >
            {/* RUBBERBAND MARQUEE SELECTION BOX */}
            {selectionBox && (
              <div
                style={{
                  left: `${Math.min(selectionBox.x1, selectionBox.x2)}px`,
                  top: `${Math.min(selectionBox.y1, selectionBox.y2)}px`,
                  width: `${Math.abs(selectionBox.x2 - selectionBox.x1)}px`,
                  height: `${Math.abs(selectionBox.y2 - selectionBox.y1)}px`,
                }}
                className="absolute border-2 border-primary bg-primary/10 rounded-xl pointer-events-none z-20"
              />
            )}

            {/* SVG BEZIER CURVES */}
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
                </marker>
              </defs>

              {connections.map((conn) => {
                const source = nodes.find((n) => n.id === conn.fromId);
                const target = nodes.find((n) => n.id === conn.toId);

                if (!source || !target) return null;

                const sourceOffsetY = source.isCollapsed ? 23 : 44;
                const targetOffsetY = target.isCollapsed ? 23 : 44;

                const x1 = source.x + 245;
                const y1 = source.y + sourceOffsetY;
                const x2 = target.x;
                const y2 = target.y + targetOffsetY;

                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                const dx = Math.abs(x2 - x1) * 0.45;
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const isEdgeActive =
                  (source.status === "running" || source.status === "success") &&
                  (target.status === "running" || target.status === "success");

                return (
                  <g key={conn.id} className="group cursor-pointer">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      onClick={() => handleDelinkConnection(conn.id)}
                      className="pointer-events-auto cursor-pointer"
                    />

                    <path
                      d={pathD}
                      fill="none"
                      stroke={isEdgeActive ? "var(--primary)" : "var(--border)"}
                      strokeWidth={isEdgeActive ? "3.5" : "2.5"}
                      markerEnd={isEdgeActive ? "url(#arrow)" : undefined}
                      className={`pointer-events-none ${isEdgeActive ? "animate-flow-line" : "group-hover:stroke-red-500 transition-colors"}`}
                    />

                    <g
                      transform={`translate(${midX - 10}, ${midY - 10})`}
                      onClick={() => handleDelinkConnection(conn.id)}
                      className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <rect width="20" height="20" rx="6" fill="var(--primary)" />
                      <path d="M 6 6 L 14 14 M 14 6 L 6 14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  </g>
                );
              })}

              {/* LIVE DRAG WIRE BEZIER LINE */}
              {connectingStartNodeId && connectingMousePos && (() => {
                const source = nodes.find((n) => n.id === connectingStartNodeId);
                if (!source) return null;

                const sourceOffsetY = source.isCollapsed ? 23 : 44;
                const x1 = source.x + 245;
                const y1 = source.y + sourceOffsetY;
                const x2 = connectingMousePos.x;
                const y2 = connectingMousePos.y;

                const dx = Math.abs(x2 - x1) * 0.45;
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                return (
                  <g className="pointer-events-none">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3.5"
                      strokeDasharray="6 6"
                      className="animate-pulse"
                    />
                    <circle cx={x2} cy={y2} r="6" fill="var(--primary)" className="animate-ping" />
                  </g>
                );
              })()}
            </svg>

            {/* SPACIOUS SHADCN NODE CARDS */}
            <div className="relative w-full h-full z-10">
              {nodes.map((node) => {
                const isSelected = selectedNodeIds.includes(node.id);
                const isNodeRunning = node.status === "running";
                const isNodeSuccess = node.status === "success";
                const isNodeError = node.status === "error";

                return (
                  <div
                    key={node.id}
                    onPointerDown={(e) => handlePointerDownNode(e, node.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeIds([node.id]);
                      setNodePropsDialogOpen(true);
                    }}
                    onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
                    style={{
                      transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                      width: "245px",
                    }}
                    className={`absolute rounded-lg border bg-background shadow-sm transition-shadow cursor-grab active:cursor-grabbing group/card font-sans ${
                      node.isCollapsed ? "p-3" : "p-4"
                    } ${
                      isSelected
                        ? "border-foreground ring-1 ring-foreground/20 shadow-md z-30"
                        : isNodeError
                        ? "border-red-500 ring-1 ring-red-500/20 z-10"
                        : "border-border hover:border-foreground/50 z-10"
                    } ${isNodeRunning ? "animate-pulse ring-1 ring-foreground" : ""} ${
                      isNodeError ? "border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.08)]" : ""
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-md bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90 cursor-pointer z-40"
                      title="Delete Node"
                    >
                      <FiX className="h-3 w-3" />
                    </button>

                    {/* INPUT HANDLE */}
                    {node.type !== "trigger" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (connectingStartNodeId && connectingStartNodeId !== node.id) {
                            handleConnectNodes(connectingStartNodeId, node.id);
                          }
                        }}
                        onPointerUp={(e) => {
                          e.stopPropagation();
                          if (connectingStartNodeId && connectingStartNodeId !== node.id) {
                            handleConnectNodes(connectingStartNodeId, node.id);
                          }
                        }}
                        className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border bg-background flex items-center justify-center cursor-pointer transition-all z-40 ${
                          connectingStartNodeId && connectingStartNodeId !== node.id
                            ? "border-foreground bg-foreground text-background scale-125"
                            : "border-muted-foreground hover:border-foreground"
                        }`}
                        title={connectingStartNodeId ? "Click to Complete Connection" : "Input Handle"}
                      />
                    )}

                    {/* OUTPUT HANDLE */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center z-40">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (connectingStartNodeId === node.id) {
                            setConnectingStartNodeId(null);
                            setQuickConnectNodeId(null);
                          } else {
                            setConnectingStartNodeId(node.id);
                            setQuickConnectNodeId(quickConnectNodeId === node.id ? null : node.id);
                          }
                        }}
                        className={`w-4 h-4 rounded-full border bg-background flex items-center justify-center cursor-crosshair transition-all ${
                          connectingStartNodeId === node.id
                            ? "border-foreground bg-foreground text-background scale-125"
                            : "border-muted-foreground hover:border-foreground"
                        }`}
                        title="Click to Connect"
                      />

                      {/* QUICK CONNECT */}
                      {quickConnectNodeId === node.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-6 top-1/2 -translate-y-1/2 w-48 bg-background border border-border rounded-md shadow-md p-2 z-50 animate-in fade-in zoom-in-95"
                        >
                          <div className="text-xs font-medium text-muted-foreground mb-2 px-1">Connect Next Node</div>
                          <div className="max-h-40 overflow-y-auto space-y-1 custom-thin-scrollbar">
                            {nodes
                              .filter((n) => n.id !== node.id)
                              .map((targetCandidate) => (
                                <button
                                  key={targetCandidate.id}
                                  type="button"
                                  onClick={() => handleConnectNodes(node.id, targetCandidate.id)}
                                  className="w-full flex items-center gap-2 p-1.5 rounded-sm hover:bg-muted text-left cursor-pointer transition-colors"
                                >
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    <BrandLogo url={targetCandidate.iconUrl} name={targetCandidate.title} />
                                  </div>
                                  <span className="text-xs font-medium truncate flex-1">{targetCandidate.title}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {node.isCollapsed ? (
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 grayscale hover:grayscale-0 transition-all opacity-80">
                            <BrandLogo url={node.iconUrl} name={node.title} />
                          </div>
                          <span className="text-sm font-medium text-foreground truncate">{node.title}</span>
                          {node.status && node.status !== "idle" && (
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              node.status === "success" ? "bg-emerald-500" :
                              node.status === "running" ? "bg-blue-500 animate-ping" :
                              node.status === "error" ? "bg-red-500" : ""
                            }`} />
                          )}
                        </div>
                        <button onClick={(e) => toggleNodeCollapse(node.id, e)} className="text-muted-foreground hover:text-foreground">
                          <FiChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3 min-w-0">
                          <div className="flex gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-md border border-border/50 bg-card flex items-center justify-center p-1.5 shrink-0 shadow-sm opacity-90 group-hover/card:opacity-100 transition-opacity">
                              <BrandLogo url={node.iconUrl} name={node.title} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-semibold text-foreground truncate block">{node.title}</span>
                              <span className="text-xs text-muted-foreground truncate block mt-0.5">{node.subtitle}</span>
                            </div>
                          </div>
                          <button onClick={(e) => toggleNodeCollapse(node.id, e)} className="text-muted-foreground hover:text-foreground mt-0.5">
                            <FiChevronUp className="h-4 w-4" />
                          </button>
                        </div>

                        {/* STATUS BUTTON */}
                        <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                                node.status === "success" ? "text-foreground" :
                                node.status === "running" ? "text-foreground animate-pulse" :
                                node.status === "error" ? "text-red-500" :
                                "text-muted-foreground"
                            }`}>
                              {node.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNodeIds([node.id]);
                                setNodePropsDialogOpen(true);
                              }}
                              className="h-7 text-xs font-medium flex-1"
                            >
                              {node.isConfigured ? "Edit Config" : "Configure"}
                            </Button>
                            {(isNodeSuccess || node.output) && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 text-xs font-medium flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOutputNode(node);
                                  setOutputModalOpen(true);
                                }}
                              >
                                View Output
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

      </div>

      {/* MOBILE CATALOG BOTTOM SHEET DIALOG */}
      <Dialog open={mobileCatalogOpen} onOpenChange={setMobileCatalogOpen}>
        <DialogContent className="md:hidden w-[95vw] rounded-lg bg-background border border-border max-h-[85vh] overflow-y-auto p-5 font-sans">
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="text-sm font-semibold flex items-center justify-between text-foreground">
              <span>Node Tool Catalog</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-border rounded text-muted-foreground">
                {filteredCatalog.length} Tools
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <Input
              placeholder="Search 40+ tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs"
            />

            <div className="grid grid-cols-2 gap-2">
              {filteredCatalog.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddNode(item)}
                  className="flex flex-col items-start p-3 rounded-xl border border-border bg-background text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center p-1.5 mb-2">
                    <BrandLogo url={item.iconUrl} name={item.title} />
                  </div>
                  <span className="font-bold text-xs text-foreground truncate w-full">{item.title}</span>
                  <span className="text-[9px] text-muted-foreground truncate w-full">{item.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RIGHT-CLICK CUSTOM CONTEXT MENU */}
      <AnimatePresence>
        {contextMenu.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed z-50 w-56 bg-card border border-border/80 rounded-2xl shadow-xl p-1.5 font-sans space-y-0.5"
          >
            <button
              onClick={() => {
                setNodePropsDialogOpen(true);
                setContextMenu({ visible: false, x: 0, y: 0, nodeId: "" });
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 rounded-xl transition-colors text-left"
            >
              <FiEdit3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Configure Node</span>
            </button>

            <button
              onClick={handleDuplicateSelected}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 rounded-xl transition-colors text-left"
            >
              <FiCopy className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Duplicate Node ({selectedNodeIds.length || 1})</span>
            </button>

            <button
              onClick={handleDisconnectSelected}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 rounded-xl transition-colors text-left"
            >
              <FiScissors className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Disconnect Lines</span>
            </button>

            <div className="h-px bg-border/60 my-1" />

            <button
              onClick={handleDeleteSelectedNodes}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors text-left"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              <span>Delete Node ({selectedNodeIds.length || 1})</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLY RESPONSIVE SHADCN TOOL CONFIGURATION MODAL */}
      <Dialog 
        open={nodePropsDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            if (isDeletingRef.current) {
              isDeletingRef.current = false;
              setNodePropsDialogOpen(false);
              return;
            }
            if (primarySelectedNode) {
              const isREST = primarySelectedNode.type !== "trigger" && 
                (primarySelectedNode.title.toLowerCase().includes("rest") || 
                 primarySelectedNode.title.toLowerCase().includes("webhook") || 
                 primarySelectedNode.title.toLowerCase().includes("http") ||
                 primarySelectedNode.title.toLowerCase().includes("api call") ||
                 primarySelectedNode.title.toLowerCase().includes("api client"));
              const config = primarySelectedNode.config || {};
              const isUrlEmpty = isREST && !(config.url || "").trim();
              if (isUrlEmpty) {
                alert(`Error: You must configure a valid Request URL for "${primarySelectedNode.title}" before closing.`);
                return;
              }
            }
          }
          setNodePropsDialogOpen(open);
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] rounded-lg bg-background border border-border shadow-md p-4 sm:p-6 overflow-y-auto font-sans custom-thin-scrollbar">
          {primarySelectedNode && (
            <div className="space-y-6">
              
              {/* MODAL HEADER */}
              <DialogHeader className="space-y-2 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-border flex items-center justify-center p-1.5 overflow-hidden">
                      <BrandLogo url={primarySelectedNode.iconUrl} name={primarySelectedNode.title} />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                        <span>{primarySelectedNode.title} Settings</span>
                        <span className="text-xs font-normal text-muted-foreground uppercase border border-border px-1.5 py-0.5 rounded">
                          {primarySelectedNode.type}
                        </span>
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        {primarySelectedNode.subtitle}
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* TABS NAVIGATION */}
              <div className="flex items-center gap-4 border-b border-border pb-px text-sm font-medium">
                <button
                  onClick={() => setModalTab("params")}
                  className={`pb-2 border-b-2 transition-colors ${
                    modalTab === "params"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Parameters
                </button>

                {primarySelectedNode.type === "llm" && (
                  <button
                    onClick={() => setModalTab("prompt")}
                    className={`pb-2 border-b-2 transition-colors ${
                      modalTab === "prompt"
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    System Prompt
                  </button>
                )}

                <button
                  onClick={() => setModalTab("performance")}
                  className={`pb-2 border-b-2 transition-colors ${
                    modalTab === "performance"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Scaling
                </button>

                <button
                  onClick={() => setModalTab("guardrails")}
                  className={`pb-2 border-b-2 transition-colors ${
                    modalTab === "guardrails"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Guardrails
                </button>
              </div>

              {/* TAB: PARAMETERS */}
              {modalTab === "params" && (
                <div className="space-y-6">
                  {primarySelectedNode.type === "llm" && (
                    <div className="space-y-6">
                      
                      {/* PROVIDER SELECTOR */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">AI Provider</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {LLM_PROVIDERS.map((prov) => {
                            const currentProvId = primarySelectedNode.config.provider || "anthropic";
                            const isSelectedProv = currentProvId === prov.id;
                            return (
                              <button
                                key={prov.id}
                                type="button"
                                onClick={() => {
                                  const defaultModel = prov.models[0].id;
                                  setNodes((prev) =>
                                    prev.map((n) =>
                                      n.id === primarySelectedNode.id
                                        ? { ...n, config: { ...n.config, provider: prov.id, model: defaultModel } }
                                        : n
                                    )
                                  );
                                }}
                                className={`flex items-center gap-2.5 p-2 rounded-md border text-left cursor-pointer transition-colors ${
                                  isSelectedProv
                                    ? "bg-muted/80 border-foreground text-foreground"
                                    : "bg-background border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                  <BrandLogo url={prov.logoUrl} name={prov.name} />
                                </div>
                                <span className="text-xs font-medium truncate">{prov.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* MODEL ENGINE SELECTOR */}
                      {(() => {
                        const activeProvId = primarySelectedNode.config.provider || "anthropic";
                        const activeProvObj = LLM_PROVIDERS.find((p) => p.id === activeProvId) || LLM_PROVIDERS[0];
                        return (
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Model Engine</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeProvObj.models.map((m) => {
                                const currentModelId = primarySelectedNode.config.model || activeProvObj.models[0].id;
                                const isSelectedModel = currentModelId === m.id;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() =>
                                      setNodes((prev) =>
                                        prev.map((n) =>
                                          n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, model: m.id } } : n
                                        )
                                      )
                                    }
                                    className={`flex flex-col items-start p-3 rounded-md border text-left cursor-pointer transition-colors ${
                                      isSelectedModel
                                        ? "bg-muted/80 border-foreground text-foreground"
                                        : "bg-background border-border hover:bg-muted/40 text-muted-foreground"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <span className="text-xs font-medium text-foreground truncate">{m.name}</span>
                                      {m.badge && (
                                        <span className="text-[9px] font-mono border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                                          {m.badge}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1 leading-normal">
                                      {m.desc}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* RESPONSE FORMAT */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Output Format</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { id: "json_object", label: "Structured JSON", desc: "Strict type-safe schema output" },
                            { id: "markdown", label: "Markdown Document", desc: "Formatted rich text & code" },
                            { id: "plaintext", label: "Plain Text Stream", desc: "Raw unformatted text buffer" },
                          ].map((fmt) => {
                            const currentFmt = primarySelectedNode.config.responseFormat || "json_object";
                            const isSelectedFmt = currentFmt === fmt.id;
                            return (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() =>
                                  setNodes((prev) =>
                                    prev.map((n) =>
                                      n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, responseFormat: fmt.id } } : n
                                    )
                                  )
                                }
                                className={`flex flex-col items-start p-3 rounded-md border text-left cursor-pointer transition-colors ${
                                  isSelectedFmt
                                    ? "bg-muted/80 border-foreground text-foreground"
                                    : "bg-background border-border hover:bg-muted/40 text-muted-foreground"
                                }`}
                              >
                                <span className="text-xs font-medium text-foreground">{fmt.label}</span>
                                <span className="text-[10px] text-muted-foreground mt-1 leading-normal">
                                  {fmt.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* OPTIONAL CUSTOM API KEY */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                          Custom API Key <span className="text-[10px] lowercase font-normal italic">(optional, overrides pool)</span>
                        </Label>
                        <Input
                          type="password"
                          value={primarySelectedNode.config.apiKey || ""}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, apiKey: e.target.value } } : n
                              )
                            )
                          }
                          placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxx (leave blank to use system pool keys)"
                          className="h-9 text-xs rounded-md font-mono bg-background border-border text-foreground"
                        />
                      </div>

                      {/* SLIDERS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-md border border-border">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Temperature</span>
                            <span>{primarySelectedNode.config.temperature || 0.2}</span>
                          </div>
                          <Slider
                            value={[primarySelectedNode.config.temperature || 0.2]}
                            max={1}
                            step={0.05}
                            onValueChange={(val) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, temperature: val[0] } } : n
                                )
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Top-P</span>
                            <span>{primarySelectedNode.config.topP || 0.95}</span>
                          </div>
                          <Slider
                            value={[primarySelectedNode.config.topP || 0.95]}
                            max={1}
                            step={0.05}
                            onValueChange={(val) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, topP: val[0] } } : n
                                )
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* SYSTEM PROMPT SHORTCUT */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">System Instructions</Label>
                        <textarea
                          value={primarySelectedNode.config.systemPrompt || ""}
                          onPointerDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, systemPrompt: e.target.value } } : n
                              )
                            )
                          }
                          placeholder="You are an autonomous AI software architect. Enter instructions..."
                          className="w-full h-24 p-3 text-xs bg-muted/30 border border-border rounded-md font-mono focus:outline-none focus:border-foreground leading-relaxed text-foreground cursor-text"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAVILY SEARCH PARAMS */}
                  {(primarySelectedNode.title.toLowerCase().includes("tavily") || (primarySelectedNode.type === "tool" && primarySelectedNode.title.toLowerCase().includes("search"))) && (
                    <div className="space-y-6">
                      
                      {/* API KEY */}
                      <div className="p-4 rounded-md border border-border space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Tavily API Key</Label>
                        <Input
                          type="password"
                          value={primarySelectedNode.config.apiKey || ""}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, apiKey: e.target.value } } : n
                              )
                            )
                          }
                          placeholder="tvly-dev-xxxxxxxxxxxxxxxxxxxxxxxx"
                          className="h-9 text-xs rounded-md font-mono bg-background border-border text-foreground"
                        />
                      </div>

                      {/* SEARCH QUERY */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Live Search Query</Label>
                        <Input
                          value={primarySelectedNode.config.query || ""}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, query: e.target.value } } : n
                              )
                            )
                          }
                          placeholder="e.g. Latest breakthroughs in autonomous AI agent frameworks 2026"
                          className="h-9 text-xs rounded-md bg-background border-border"
                        />
                      </div>

                      {/* SEARCH DEPTH */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Search Depth Tier</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: "advanced", label: "Advanced Analysis", desc: "Deep multi-query semantic search" },
                            { id: "basic", label: "Basic Fast Search", desc: "Speed optimized standard search" },
                          ].map((depth) => {
                            const isCurrent = (primarySelectedNode.config.searchDepth || "advanced") === depth.id;
                            return (
                              <button
                                key={depth.id}
                                type="button"
                                onClick={() =>
                                  setNodes((prev) =>
                                    prev.map((n) =>
                                      n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, searchDepth: depth.id } } : n
                                    )
                                  )
                                }
                                className={`flex flex-col items-start p-3 rounded-md border text-left cursor-pointer transition-colors ${
                                  isCurrent
                                    ? "bg-muted/80 border-foreground text-foreground"
                                    : "bg-background border-border hover:bg-muted/40 text-muted-foreground"
                                }`}
                              >
                                <span className="text-xs font-medium text-foreground">{depth.label}</span>
                                <span className="text-[10px] text-muted-foreground mt-1">{depth.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* TOPIC FILTER */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Topic Category Filter</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "general", label: "General Web" },
                            { id: "news", label: "Realtime News" },
                            { id: "finance", label: "Financial Data" },
                            { id: "code", label: "Code Repositories" },
                          ].map((cat) => {
                            const isSelectedCat = (primarySelectedNode.config.topic || "general") === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() =>
                                  setNodes((prev) =>
                                    prev.map((n) =>
                                      n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, topic: cat.id } } : n
                                    )
                                  )
                                }
                                className={`p-2 rounded-md border text-center cursor-pointer transition-colors text-xs font-medium ${
                                  isSelectedCat
                                    ? "bg-muted/80 border-foreground text-foreground"
                                    : "bg-background border-border hover:bg-muted/40 text-muted-foreground"
                                }`}
                              >
                                {cat.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* MAX RESULTS */}
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        className="space-y-2 p-4 rounded-md border border-border"
                      >
                        <div className="flex justify-between items-center text-xs font-medium">
                          <span>Max Search Results</span>
                          <span>{primarySelectedNode.config.maxResults || 5} Results</span>
                        </div>
                        <Slider
                          value={[Math.min(10, primarySelectedNode.config.maxResults || 5)]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(val) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, maxResults: val[0] } } : n
                              )
                            )
                          }
                          className="cursor-pointer py-1"
                        />
                      </div>

                      {/* TOGGLES */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <label className="flex items-center gap-2.5 p-3 rounded-md border border-border cursor-pointer text-xs font-medium hover:bg-muted/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={primarySelectedNode.config.includeAnswer !== false}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, includeAnswer: e.target.checked } } : n
                                )
                              )
                            }
                            className="rounded border-border text-foreground focus:ring-foreground h-4 w-4 cursor-pointer"
                          />
                          <span>AI Direct Summary</span>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-md border border-border cursor-pointer text-xs font-medium hover:bg-muted/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={Boolean(primarySelectedNode.config.includeRawContent)}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, includeRawContent: e.target.checked } } : n
                                )
                              )
                            }
                            className="rounded border-border text-foreground focus:ring-foreground h-4 w-4 cursor-pointer"
                          />
                          <span>Full Raw HTML</span>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-md border border-border cursor-pointer text-xs font-medium hover:bg-muted/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={Boolean(primarySelectedNode.config.includeImages)}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, includeImages: e.target.checked } } : n
                                )
                              )
                            }
                            className="rounded border-border text-foreground focus:ring-foreground h-4 w-4 cursor-pointer"
                          />
                          <span>Related Images</span>
                        </label>
                      </div>

                    </div>
                  )}

                  {/* WEBHOOK TRIGGER PARAMS */}
                  {primarySelectedNode.type === "trigger" && primarySelectedNode.title.toLowerCase().includes("webhook") && (
                    <div className="space-y-6">
                      {/* HTTP METHOD SELECTOR (CUSTOM DROPDOWN) */}
                      <div className="space-y-2 relative">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Listening HTTP Method</Label>
                        
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 h-10 rounded-md border border-border bg-background cursor-pointer hover:bg-muted/30 transition-all font-sans text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {(() => {
                                const currentMethod = primarySelectedNode.config.method || "POST";
                                if (currentMethod === "GET") {
                                  return (
                                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                      GET
                                    </span>
                                  );
                                }
                                return (
                                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    POST
                                  </span>
                                );
                              })()}
                              <span className="text-muted-foreground text-xs font-sans">
                                (Trigger fires when client issues this request type)
                              </span>
                            </div>
                            <span className="text-muted-foreground text-[10px]">▼</span>
                          </button>

                          {methodDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-1.5 z-50 bg-background border border-border rounded-md shadow-lg p-1.5 space-y-1 font-sans">
                              {[
                                { id: "GET", label: "GET Request", desc: "Retrieve data or start workflow via query link", badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                                { id: "POST", label: "POST Request", desc: "Send payload payload, webhook alerts, JSON data", badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" }
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setNodes((prev) =>
                                      prev.map((n) =>
                                        n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, method: opt.id } } : n
                                      )
                                    );
                                    setMethodDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between p-2.5 rounded-sm hover:bg-muted text-left cursor-pointer transition-colors"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</span>
                                  </div>
                                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${opt.badgeClass}`}>
                                    {opt.id}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* WEBHOOK URL */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Production Webhook URL</Label>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={`http://localhost:6430/api/v1/webhooks/${primarySelectedNode.id}`}
                            className="h-9 text-xs rounded-md bg-muted/40 border-border text-muted-foreground font-mono select-all flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`http://localhost:6430/api/v1/webhooks/${primarySelectedNode.id}`);
                              setWebhookCopied(true);
                              setTimeout(() => setWebhookCopied(false), 2000);
                            }}
                            className="h-9 text-xs font-medium rounded-md px-3 border border-border bg-background"
                          >
                            <span>{webhookCopied ? "Copied" : "Copy URL"}</span>
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                          Deploy the workflow, then send HTTP requests to this URL to trigger real-time executions.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* REST API CLIENT / WEBHOOK ACTIONS PARAMS (THUNDER CLIENT STYLE) */}
                  {primarySelectedNode.type !== "trigger" && 
                    (primarySelectedNode.title.toLowerCase().includes("rest") || 
                     primarySelectedNode.title.toLowerCase().includes("webhook") || 
                     primarySelectedNode.title.toLowerCase().includes("http") ||
                     primarySelectedNode.title.toLowerCase().includes("api call") ||
                     primarySelectedNode.title.toLowerCase().includes("api client")) && (
                    <div className="space-y-6 font-sans">
                      
                      {/* REQUEST METHOD & URL BAR */}
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <div className="relative w-full sm:w-28 shrink-0">
                          <button
                            type="button"
                            onClick={() => setRestMethodDropdownOpen(!restMethodDropdownOpen)}
                            className="w-full flex items-center justify-between px-2.5 h-9 rounded-md border border-border bg-background cursor-pointer hover:bg-muted/30 transition-all font-mono text-xs font-semibold"
                          >
                            {(() => {
                              const currentMethod = primarySelectedNode.config.method || "GET";
                              return (
                                <span className={`text-xs ${
                                  currentMethod === "GET" ? "text-blue-500" :
                                  currentMethod === "POST" ? "text-emerald-500" :
                                  currentMethod === "PUT" ? "text-amber-500" :
                                  currentMethod === "DELETE" ? "text-red-500" : "text-purple-500"
                                }`}>
                                  {currentMethod}
                                </span>
                              );
                            })()}
                            <span className="text-muted-foreground text-[8px]">▼</span>
                          </button>

                          {restMethodDropdownOpen && (
                            <div className="absolute left-0 mt-1.5 w-32 z-50 bg-background border border-border rounded-md shadow-lg p-1 space-y-0.5 font-sans">
                              {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    setNodes((prev) =>
                                      prev.map((n) =>
                                        n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, method: m } } : n
                                      )
                                    );
                                    setRestMethodDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between p-2 rounded-sm hover:bg-muted text-left cursor-pointer transition-colors"
                                >
                                  <span className={`font-mono text-xs font-semibold ${
                                    m === "GET" ? "text-blue-500" :
                                    m === "POST" ? "text-emerald-500" :
                                    m === "PUT" ? "text-amber-500" :
                                    m === "DELETE" ? "text-red-500" : "text-purple-500"
                                  }`}>
                                    {m}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <Input
                          value={primarySelectedNode.config.url || ""}
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            setNodes((prev) =>
                              prev.map((n) => {
                                if (n.id !== primarySelectedNode.id) return n;
                                let extractedList = n.config.queryList || [{ key: "", value: "" }];
                                try {
                                  if (newUrl.includes("?")) {
                                    const qs = newUrl.split("?")[1];
                                    const params = new URLSearchParams(qs);
                                    const list: {key: string, value: string}[] = [];
                                    params.forEach((v, k) => {
                                      list.push({ key: k, value: v });
                                    });
                                    if (list.length > 0) extractedList = list;
                                  }
                                } catch {}
                                return { ...n, config: { ...n.config, url: newUrl, queryList: extractedList } };
                              })
                            );
                          }}
                          placeholder="https://api.example.com/v1/resource"
                          className="h-9 text-xs rounded-md bg-background border-border flex-1 font-mono text-foreground"
                        />
                      </div>

                      {/* SUB-TABS SELECTOR */}
                      <div className="flex flex-wrap gap-2.5 sm:gap-4 border-b border-border pb-px text-xs font-semibold text-muted-foreground mt-4">
                        {[
                          { id: "headers", label: "Headers" },
                          { id: "query", label: "Query" },
                          { id: "auth", label: "Auth" },
                          { id: "body", label: "Body" }
                        ].map((t) => {
                          const isSelected = restTab === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setRestTab(t.id as any)}
                              className={`pb-1.5 border-b-2 transition-colors cursor-pointer ${
                                isSelected
                                  ? "border-foreground text-foreground"
                                  : "border-transparent hover:text-foreground"
                              }`}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* SUB-TAB: HEADERS */}
                      {restTab === "headers" && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">HTTP Request Headers</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentList = primarySelectedNode.config.headersList || [{ key: "", value: "" }];
                                const newList = [...currentList, { key: "", value: "" }];
                                setNodes((prev) =>
                                  prev.map((n) =>
                                    n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, headersList: newList } } : n
                                  )
                                );
                              }}
                              className="h-7 text-[10px] px-2 rounded border border-border"
                            >
                              Add Header
                            </Button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto custom-thin-scrollbar pr-1">
                            {(() => {
                              const list = primarySelectedNode.config.headersList || [{ key: "", value: "" }];
                              return list.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Input
                                    value={item.key || ""}
                                    placeholder="Header Name"
                                    onChange={(e) => {
                                      const newList = [...list];
                                      newList[idx] = { ...newList[idx], key: e.target.value };
                                      const dict: any = {};
                                      newList.forEach(x => { if (x.key?.trim()) dict[x.key.trim()] = x.value || ""; });
                                      setNodes((prev) =>
                                        prev.map((n) =>
                                          n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, headersList: newList, headers: dict } } : n
                                        )
                                      );
                                    }}
                                    className="h-8 text-xs font-mono flex-1 min-w-0"
                                  />
                                  <Input
                                    value={item.value || ""}
                                    placeholder="Value"
                                    onChange={(e) => {
                                      const newList = [...list];
                                      newList[idx] = { ...newList[idx], value: e.target.value };
                                      const dict: any = {};
                                      newList.forEach(x => { if (x.key?.trim()) dict[x.key.trim()] = x.value || ""; });
                                      setNodes((prev) =>
                                        prev.map((n) =>
                                          n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, headersList: newList, headers: dict } } : n
                                        )
                                      );
                                    }}
                                    className="h-8 text-xs font-mono flex-1 min-w-0"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newList = list.filter((_: any, i: number) => i !== idx);
                                      const finalList = newList.length > 0 ? newList : [{ key: "", value: "" }];
                                      const dict: any = {};
                                      finalList.forEach(x => { if (x.key?.trim()) dict[x.key.trim()] = x.value || ""; });
                                      setNodes((prev) =>
                                        prev.map((n) =>
                                          n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, headersList: finalList, headers: dict } } : n
                                        )
                                      );
                                    }}
                                    className="h-8 px-2 text-red-500 hover:text-red-600 rounded"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* SUB-TAB: QUERY */}
                      {restTab === "query" && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">URL Query Parameters</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentList = primarySelectedNode.config.queryList || [{ key: "", value: "" }];
                                const newList = [...currentList, { key: "", value: "" }];
                                setNodes((prev) =>
                                  prev.map((n) =>
                                    n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, queryList: newList } } : n
                                  )
                                );
                              }}
                              className="h-7 text-[10px] px-2 rounded border border-border"
                            >
                              Add Parameter
                            </Button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto custom-thin-scrollbar pr-1">
                            {(() => {
                              const list = primarySelectedNode.config.queryList || [{ key: "", value: "" }];
                              return list.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Input
                                    value={item.key || ""}
                                    placeholder="Param Key"
                                    onChange={(e) => {
                                      const newList = [...list];
                                      newList[idx] = { ...newList[idx], key: e.target.value };
                                      
                                      const currentUrl = primarySelectedNode.config.url || "";
                                      const baseUrl = currentUrl.split("?")[0];
                                      const params = new URLSearchParams();
                                      newList.forEach(x => { if (x.key?.trim()) params.append(x.key.trim(), x.value || ""); });
                                      const qs = params.toString();
                                      const finalUrl = qs ? `${baseUrl}?${qs}` : baseUrl;

                                      setNodes((prev) =>
                                        prev.map((n) =>
                                          n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, queryList: newList, url: finalUrl } } : n
                                        )
                                      );
                                    }}
                                    className="h-8 text-xs font-mono flex-1 min-w-0"
                                  />
                                  <Input
                                    value={item.value || ""}
                                    placeholder="Value"
                                    onChange={(e) => {
                                      const newList = [...list];
                                      newList[idx] = { ...newList[idx], value: e.target.value };
                                      
                                      const currentUrl = primarySelectedNode.config.url || "";
                                      const baseUrl = currentUrl.split("?")[0];
                                      const params = new URLSearchParams();
                                      newList.forEach(x => { if (x.key?.trim()) params.append(x.key.trim(), x.value || ""); });
                                      const qs = params.toString();
                                      const finalUrl = qs ? `${baseUrl}?${qs}` : baseUrl;

                                      setNodes((prev) =>
                                        prev.map((n) =>
                                          n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, queryList: newList, url: finalUrl } } : n
                                        )
                                      );
                                    }}
                                    className="h-8 text-xs font-mono flex-1 min-w-0"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newList = list.filter((_: any, i: number) => i !== idx);
                                      const finalList = newList.length > 0 ? newList : [{ key: "", value: "" }];
                                      
                                      const currentUrl = primarySelectedNode.config.url || "";
                                      const baseUrl = currentUrl.split("?")[0];
                                      const params = new URLSearchParams();
                                      finalList.forEach(x => { if (x.key?.trim()) params.append(x.key.trim(), x.value || ""); });
                                      const qs = params.toString();
                                      const finalUrl = qs ? `${baseUrl}?${qs}` : baseUrl;

                                      setNodes((prev) =>
                                        prev.map((n) =>
                                          n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, queryList: finalList, url: finalUrl } } : n
                                        )
                                      );
                                    }}
                                    className="h-8 px-2 text-red-500 hover:text-red-600 rounded"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* SUB-TAB: AUTH */}
                      {restTab === "auth" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Authentication Type</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: "none", label: "No Auth" },
                                { id: "bearer", label: "Bearer Token" },
                                { id: "basic", label: "Basic Auth" }
                              ].map((opt) => {
                                const currentAuth = primarySelectedNode.config.authType || "none";
                                const isSelected = currentAuth === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                      setNodes((prev) =>
                                        prev.map((n) => {
                                          if (n.id !== primarySelectedNode.id) return n;
                                          const nextConfig = { ...n.config, authType: opt.id };
                                          const headersList = n.config.headersList || [{ key: "", value: "" }];
                                          const filteredHeaders = headersList.filter((x: any) => x.key?.toLowerCase() !== "authorization");
                                          nextConfig.headersList = filteredHeaders.length > 0 ? filteredHeaders : [{ key: "", value: "" }];
                                          
                                          const dict: any = {};
                                          nextConfig.headersList.forEach((x: any) => { if (x.key?.trim()) dict[x.key.trim()] = x.value || ""; });
                                          nextConfig.headers = dict;
                                          
                                          return { ...n, config: nextConfig };
                                        })
                                      );
                                    }}
                                    className={`p-2.5 rounded-md border text-center cursor-pointer text-xs font-medium transition-colors ${
                                      isSelected
                                        ? "bg-muted/80 border-foreground text-foreground"
                                        : "bg-background border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {primarySelectedNode.config.authType === "bearer" && (
                            <div className="space-y-2 p-4 rounded-md border border-border bg-muted/20">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Token</Label>
                              <Input
                                value={primarySelectedNode.config.authToken || ""}
                                placeholder="Token (without 'Bearer ' prefix)"
                                onChange={(e) => {
                                  const token = e.target.value;
                                  const headersList = primarySelectedNode.config.headersList || [{ key: "", value: "" }];
                                  const filtered = headersList.filter((x: any) => x.key?.toLowerCase() !== "authorization");
                                  const newList = [...filtered];
                                  if (token.trim()) {
                                    newList.push({ key: "Authorization", value: `Bearer ${token.trim()}` });
                                  }
                                  const dict: any = {};
                                  newList.forEach(x => { if (x.key?.trim()) dict[x.key.trim()] = x.value || ""; });
                                  setNodes((prev) =>
                                    prev.map((n) =>
                                      n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, authToken: token, headersList: newList, headers: dict } } : n
                                    )
                                  );
                                }}
                                className="h-9 text-xs font-mono"
                              />
                            </div>
                          )}

                          {primarySelectedNode.config.authType === "basic" && (
                            <div className="space-y-3 p-4 rounded-md border border-border bg-muted/20">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Username</Label>
                                <Input
                                  value={primarySelectedNode.config.authUsername || ""}
                                  placeholder="username"
                                  onChange={(e) => {
                                    const user = e.target.value;
                                    const pass = primarySelectedNode.config.authPassword || "";
                                    const headersList = primarySelectedNode.config.headersList || [{ key: "", value: "" }];
                                    const filtered = headersList.filter((x: any) => x.key?.toLowerCase() !== "authorization");
                                    const newList = [...filtered];
                                    if (user.trim() || pass.trim()) {
                                      const encoded = btoa(`${user.trim()}:${pass.trim()}`);
                                      newList.push({ key: "Authorization", value: `Basic ${encoded}` });
                                    }
                                    const dict: any = {};
                                    newList.forEach(x => { if (x.key?.trim()) dict[x.key.trim()] = x.value || ""; });
                                    setNodes((prev) =>
                                      prev.map((n) =>
                                        n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, authUsername: user, headersList: newList, headers: dict } } : n
                                      )
                                    );
                                  }}
                                  className="h-8 text-xs font-mono"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Password</Label>
                                <Input
                                  type="password"
                                  value={primarySelectedNode.config.authPassword || ""}
                                  placeholder="password"
                                  onChange={(e) => {
                                    const user = primarySelectedNode.config.authUsername || "";
                                    const pass = e.target.value;
                                    const headersList = primarySelectedNode.config.headersList || [{ key: "", value: "" }];
                                    const filtered = headersList.filter((x: any) => x.key?.toLowerCase() !== "authorization");
                                    const newList = [...filtered];
                                    if (user.trim() || pass.trim()) {
                                      const encoded = btoa(`${user.trim()}:${pass.trim()}`);
                                      newList.push({ key: "Authorization", value: `Basic ${encoded}` });
                                    }
                                    const dict: any = {};
                                    newList.forEach(x => { if (x.key?.trim()) dict[x.key.trim()] = x.value || ""; });
                                    setNodes((prev) =>
                                      prev.map((n) =>
                                        n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, authPassword: pass, headersList: newList, headers: dict } } : n
                                      )
                                    );
                                  }}
                                  className="h-8 text-xs font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUB-TAB: BODY */}
                      {restTab === "body" && (
                        <div className="space-y-3">
                          {["POST", "PUT", "PATCH", "DELETE"].includes(primarySelectedNode.config.method || "GET") ? (
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Raw JSON Payload Body</Label>
                              <textarea
                                value={primarySelectedNode.config.body || ""}
                                onPointerDown={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  setNodes((prev) =>
                                    prev.map((n) =>
                                      n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, body: e.target.value } } : n
                                    )
                                  )
                                }
                                placeholder='{\n  "name": "Jane Doe",\n  "role": "admin"\n}'
                                className="w-full h-32 p-3 text-xs bg-muted/30 border border-border rounded-md font-mono focus:outline-none focus:border-foreground leading-normal text-foreground cursor-text"
                              />
                            </div>
                          ) : (
                            <div className="p-4 rounded-md border border-border bg-muted/10 text-center text-xs text-muted-foreground py-8">
                              HTTP GET requests do not support sending payload bodies. Change request method to POST, PUT, PATCH, or DELETE to edit body payload.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DEVELOPER TOOLS (PYTHON, JS, DOCKER) */}
                  {primarySelectedNode.type === "tool" && 
                    (primarySelectedNode.title.toLowerCase().includes("python") || 
                     primarySelectedNode.title.toLowerCase().includes("javascript") || 
                     primarySelectedNode.title.toLowerCase().includes("js") || 
                     primarySelectedNode.title.toLowerCase().includes("docker")) && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Execution Script</Label>
                        <textarea
                          value={primarySelectedNode.config.script || ""}
                          onPointerDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, script: e.target.value } } : n
                              )
                            )
                          }
                          placeholder={
                            primarySelectedNode.title.toLowerCase().includes("python")
                              ? "def main(payload):\n    # Write Python code inside isolated gVisor MicroVM\n    return { \"status\": \"processed\", \"data\": payload }\n"
                              : "function main(payload) {\n    // Node.js Sandbox Environment\n    return { status: 'processed', data: payload };\n}"
                          }
                          className="w-full h-48 p-3 text-xs bg-muted/30 border border-border rounded-md font-mono focus:outline-none focus:border-foreground leading-relaxed text-foreground cursor-text"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Timeout Limit</span>
                            <span>{primarySelectedNode.config.timeout || 30}s</span>
                          </div>
                          <Slider
                            value={[primarySelectedNode.config.timeout || 30]}
                            min={5}
                            max={60}
                            step={5}
                            onValueChange={(val) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, timeout: val[0] } } : n
                                )
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Memory Limit</span>
                            <span>{primarySelectedNode.config.memoryLimit || 512}MB</span>
                          </div>
                          <Slider
                            value={[primarySelectedNode.config.memoryLimit || 512]}
                            min={128}
                            max={2048}
                            step={128}
                            onValueChange={(val) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, memoryLimit: val[0] } } : n
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DATABASES & MEMORY CONNECTIONS */}
                  {(primarySelectedNode.category === "Databases & Memory" || 
                    primarySelectedNode.type === "database" || 
                    primarySelectedNode.type === "memory") && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Connection String / API Key</Label>
                        <Input
                          type="password"
                          value={primarySelectedNode.config.connectionString || ""}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, connectionString: e.target.value } } : n
                              )
                            )
                          }
                          placeholder={
                            primarySelectedNode.title.toLowerCase().includes("pinecone")
                              ? "pc_api_xxxxxxxxxxxxxxxxxxxxxx"
                              : "postgresql://username:password@localhost:5432/database"
                          }
                          className="h-9 text-xs font-mono bg-background border-border text-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                            {primarySelectedNode.title.toLowerCase().includes("pinecone") || 
                             primarySelectedNode.title.toLowerCase().includes("qdrant")
                              ? "Index / Namespace Name"
                              : "Database / Collection Name"}
                          </Label>
                          <Input
                            value={primarySelectedNode.config.databaseName || ""}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, databaseName: e.target.value } } : n
                                )
                              )
                            }
                            placeholder="e.g. production-v1"
                            className="h-9 text-xs bg-background border-border text-foreground"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Action / Operation</Label>
                          <Select
                            value={primarySelectedNode.config.dbOperation || "query"}
                            onValueChange={(val) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, dbOperation: val } } : n
                                )
                              )
                            }
                          >
                            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="query">Search / Select Query</SelectItem>
                              <SelectItem value="upsert">Upsert / Insert Record</SelectItem>
                              <SelectItem value="delete">Delete / Drop Entry</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Database Query / Payload JSON</Label>
                        <textarea
                          value={primarySelectedNode.config.dbQuery || ""}
                          onPointerDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, dbQuery: e.target.value } } : n
                              )
                            )
                          }
                          placeholder={
                            primarySelectedNode.title.toLowerCase().includes("postgres")
                              ? "SELECT id, name, description FROM items WHERE category = {{input.query}} LIMIT 5;"
                              : "{\n  \"vector\": [0.15, 0.88, -0.41],\n  \"topK\": 10,\n  \"includeMetadata\": true\n}"
                          }
                          className="w-full h-24 p-3 text-xs bg-muted/30 border border-border rounded-md font-mono focus:outline-none focus:border-foreground leading-relaxed text-foreground cursor-text"
                        />
                      </div>
                    </div>
                  )}

                  {/* APPS & APIS CONNECTORS */}
                  {primarySelectedNode.category === "Apps & APIs" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Access Token / Incoming Webhook URL</Label>
                        <Input
                          type="password"
                          value={primarySelectedNode.config.appToken || ""}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, appToken: e.target.value } } : n
                              )
                            )
                          }
                          placeholder="https://hooks.slack.com/services/T00/B00/X00"
                          className="h-9 text-xs font-mono bg-background border-border text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Target Channel / Destination ID</Label>
                        <Input
                          value={primarySelectedNode.config.appDestination || ""}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, appDestination: e.target.value } } : n
                              )
                            )
                          }
                          placeholder="#ai-pipeline-alerts"
                          className="h-9 text-xs bg-background border-border text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Rich Message Markdown Template</Label>
                        <textarea
                          value={primarySelectedNode.config.appTemplate || ""}
                          onPointerDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, appTemplate: e.target.value } } : n
                              )
                            )
                          }
                          placeholder="🚨 *Pipeline Execution Success!*\nWorkflow ID: {{graph_id}}\nResponse output:\n```json\n{{llm-1.output}}\n```"
                          className="w-full h-28 p-3 text-xs bg-muted/30 border border-border rounded-md font-mono focus:outline-none focus:border-foreground leading-relaxed text-foreground cursor-text"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: SYSTEM PROMPT STUDIO */}
              {modalTab === "prompt" && primarySelectedNode && (
                <div className="space-y-6">
                  {(() => {
                    const upstreamConns = connections.filter((c) => c.toId === primarySelectedNode.id);
                    const upstreamNodes = upstreamConns
                      .map((c) => nodes.find((n) => n.id === c.fromId))
                      .filter(Boolean) as CanvasNode[];

                    const insertVar = (varName: string) => {
                      const curr = primarySelectedNode.config.systemPrompt || "";
                      const nextVal = curr ? `${curr} ${varName}` : varName;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, systemPrompt: nextVal } } : n
                        )
                      );
                    };

                    return (
                      <div className="rounded-md border border-border p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">Prompt Workspace</h4>
                            <p className="text-xs text-muted-foreground">Dynamic flow context & variables</p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="text-muted-foreground">Presets:</span>
                            <button
                              type="button"
                              onClick={() => insertVar("Synthesize search results into a concise summary.")}
                              className="px-2 py-1 rounded border border-border hover:bg-muted text-xs cursor-pointer"
                            >
                              Synthesizer
                            </button>
                            <button
                              type="button"
                              onClick={() => insertVar("Extract structured entities into JSON.")}
                              className="px-2 py-1 rounded border border-border hover:bg-muted text-xs cursor-pointer"
                            >
                              Extractor
                            </button>
                          </div>
                        </div>

                        {/* FLOW VARIABLES */}
                        <div className="space-y-2 p-3 bg-muted/30 rounded border border-border">
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                            Upstream Flow Variables
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {upstreamNodes.length > 0 ? (
                              upstreamNodes.map((uNode) => {
                                const varPill1 = `{{${uNode.id}.output}}`;
                                const varPill2 = uNode.title.toLowerCase().includes("tavily")
                                  ? `{{${uNode.id}.answer}}`
                                  : `{{${uNode.id}.payload}}`;

                                return (
                                  <div key={uNode.id} className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => insertVar(varPill1)}
                                      className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-background hover:bg-muted"
                                    >
                                      {varPill1}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => insertVar(varPill2)}
                                      className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-background hover:bg-muted"
                                    >
                                      {varPill2}
                                    </button>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                <span>Placeholders:</span>
                                <button
                                  type="button"
                                  onClick={() => insertVar("{{input.query}}")}
                                  className="font-mono text-foreground border border-border px-1.5 py-0.5 rounded hover:bg-muted"
                                >
                                  {"{{input.query}}"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* TEXTAREA */}
                        <div>
                          <textarea
                            value={primarySelectedNode.config.systemPrompt || ""}
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, systemPrompt: e.target.value } } : n
                                )
                              )
                            }
                            placeholder="Enter system instructions or click an upstream flow variable above to inject dynamic data (e.g. {{tool-1.answer}})..."
                            className="w-full h-44 p-3 text-xs bg-muted/30 border border-border rounded-md font-mono focus:outline-none focus:border-foreground leading-relaxed text-foreground cursor-text"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB: SCALING */}
              {modalTab === "performance" && (
                <div className="space-y-6">
                  
                  {/* RETRY STRATEGY */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Retry Backoff Strategy</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "exponential", label: "Exponential Backoff", desc: "Doubles delay per retry" },
                        { id: "fixed", label: "Fixed Interval", desc: "Constant 1000ms delay" },
                        { id: "none", label: "No Retries", desc: "Fail fast immediately" },
                      ].map((strat) => {
                        const isStratActive = (primarySelectedNode.config.retryStrategy || "exponential") === strat.id;
                        return (
                          <button
                            key={strat.id}
                            type="button"
                            onClick={() =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, retryStrategy: strat.id } } : n
                                )
                              )
                            }
                            className={`flex flex-col items-start p-3 rounded-md border text-left cursor-pointer transition-colors ${
                              isStratActive
                                ? "bg-muted/80 border-foreground text-foreground"
                                : "bg-background border-border hover:bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            <span className="text-xs font-medium text-foreground">{strat.label}</span>
                            <span className="text-[10px] text-muted-foreground mt-1 leading-normal">
                              {strat.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CONCURRENCY */}
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="space-y-2 p-4 rounded-md border border-border"
                  >
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span>Worker Concurrency Threads</span>
                      <span>{primarySelectedNode.config.concurrency || 10} Threads</span>
                    </div>
                    <Slider
                      value={[primarySelectedNode.config.concurrency || 10]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={(val) =>
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, concurrency: val[0] } } : n
                          )
                        )
                      }
                      className="cursor-pointer py-1"
                    />
                  </div>

                  {/* MEMORY */}
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="space-y-2 p-4 rounded-md border border-border"
                  >
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span>MicroVM Memory Allocation</span>
                      <span>{primarySelectedNode.config.memoryLimit || 512} MB</span>
                    </div>
                    <Slider
                      value={[primarySelectedNode.config.memoryLimit || 512]}
                      min={128}
                      max={2048}
                      step={128}
                      onValueChange={(val) =>
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, memoryLimit: val[0] } } : n
                          )
                        )
                      }
                      className="cursor-pointer py-1"
                    />
                  </div>

                </div>
              )}

              {/* TAB: GUARDRAILS */}
              {modalTab === "guardrails" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block font-sans">Failover Model Engine</Label>
                    <Select
                      value={primarySelectedNode.config.fallbackModel || "gpt-4o"}
                      onValueChange={(val) =>
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, fallbackModel: val } } : n
                          )
                        )
                      }
                    >
                      <SelectTrigger className="h-9 text-xs rounded-md mt-1 border-border bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">OpenAI GPT-4o Failover</SelectItem>
                        <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet Failover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteNode(primarySelectedNode.id)}
                    className="text-red-500 hover:bg-red-50/50 border-border text-xs font-medium h-9 px-3 rounded-md cursor-pointer"
                  >
                    Delete Node
                  </Button>
                  {(() => {
                    const isREST = primarySelectedNode.type !== "trigger" && 
                      (primarySelectedNode.title.toLowerCase().includes("rest") || 
                       primarySelectedNode.title.toLowerCase().includes("webhook") || 
                       primarySelectedNode.title.toLowerCase().includes("http") ||
                       primarySelectedNode.title.toLowerCase().includes("api call") ||
                       primarySelectedNode.title.toLowerCase().includes("api client"));
                    const isUrlEmpty = isREST && !(primarySelectedNode.config.url || "").trim();
                    if (isUrlEmpty) {
                      return (
                        <span className="text-[10px] text-red-500 font-medium font-sans">
                          * Request URL is required
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                <Button
                  disabled={(() => {
                    const isREST = primarySelectedNode.type !== "trigger" && 
                      (primarySelectedNode.title.toLowerCase().includes("rest") || 
                       primarySelectedNode.title.toLowerCase().includes("webhook") || 
                       primarySelectedNode.title.toLowerCase().includes("http") ||
                       primarySelectedNode.title.toLowerCase().includes("api call") ||
                       primarySelectedNode.title.toLowerCase().includes("api client"));
                    const isUrlEmpty = isREST && !(primarySelectedNode.config.url || "").trim();
                    return isUrlEmpty;
                  })()}
                  onClick={() => {
                    if (primarySelectedNode) {
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === primarySelectedNode.id ? { ...n, isConfigured: true } : n
                        )
                      );
                    }
                    setNodePropsDialogOpen(false);
                  }}
                  className="bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs h-9 px-6 rounded-md cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AST JSON EXPORT MODAL */}
      <Dialog open={jsonExportOpen} onOpenChange={setJsonExportOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl rounded-lg bg-background border border-border p-6 font-sans shadow-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">Compiled AST Schema</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Production AST workflow JSON schema deployed to NEXUS Edge Cloud.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="absolute right-3 top-3 h-7 text-xs font-medium rounded-md bg-background border-border"
            >
              <span>{jsonCopied ? "Copied" : "Copy JSON"}</span>
            </Button>
            <pre className="bg-muted p-4 rounded-md border border-border text-xs font-mono text-foreground max-h-60 overflow-y-auto leading-normal">
              {graphJson}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* DEDICATED EXECUTION OUTPUT STUDIO MODAL WITH EXPORT */}
      <Dialog open={outputModalOpen} onOpenChange={setOutputModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl lg:max-w-4xl rounded-lg bg-background border border-border shadow-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden font-sans custom-thin-scrollbar">
          {selectedOutputNode && (
            <div className="space-y-6 min-w-0 w-full overflow-hidden">
              
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="max-w-full overflow-hidden">
                  <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">
                    {selectedOutputNode.title} Output
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1 break-all max-w-full">
                    Query: {selectedOutputNode.output?.query || selectedOutputNode.config?.query || "None"}
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const payload = JSON.stringify(selectedOutputNode.output || { status: "success" }, null, 2);
                      navigator.clipboard.writeText(payload);
                      setExportCopied(true);
                      setTimeout(() => setExportCopied(false), 2000);
                    }}
                    className="h-8 text-xs font-medium rounded-md"
                  >
                    {exportCopied ? "Copied" : "Copy JSON"}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      const payload = JSON.stringify(selectedOutputNode.output || { status: "success" }, null, 2);
                      const blob = new Blob([payload], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${selectedOutputNode.title.toLowerCase().replace(/\s+/g, "_")}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="h-8 text-xs font-medium rounded-md bg-foreground text-background hover:bg-foreground/90"
                  >
                    Export JSON
                  </Button>
                </div>
              </div>

              {/* TABS */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 border-b border-border pb-px text-sm font-medium">
                <button
                  onClick={() => setOutputModalTab("overview")}
                  className={`pb-2 border-b-2 transition-colors ${
                    outputModalTab === "overview"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setOutputModalTab("sources")}
                  className={`pb-2 border-b-2 transition-colors ${
                    outputModalTab === "sources"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sources
                </button>
                <button
                  onClick={() => setOutputModalTab("json")}
                  className={`pb-2 border-b-2 transition-colors ${
                    outputModalTab === "json"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Raw JSON
                </button>
                <button
                  onClick={() => setOutputModalTab("audit")}
                  className={`pb-2 border-b-2 transition-colors ${
                    outputModalTab === "audit"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Logs
                </button>
              </div>

              {/* TAB: OVERVIEW */}
              {outputModalTab === "overview" && (
                <div className="space-y-6 max-w-full overflow-hidden">
                  {(selectedOutputNode.type === "llm" || selectedOutputNode.output?.system_prompt) && (
                    <div className="p-4 rounded-md bg-muted/50 border border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">System Prompt</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {selectedOutputNode.output?.system_prompt || selectedOutputNode.config?.systemPrompt || "None"}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-md border border-border max-w-full overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
                      {selectedOutputNode.type === "llm" || selectedOutputNode.title.toLowerCase().includes("groq")
                        ? "Synthesis Output"
                        : selectedOutputNode.title.toLowerCase().includes("rest") || selectedOutputNode.title.toLowerCase().includes("webhook") || selectedOutputNode.title.toLowerCase().includes("http")
                        ? "HTTP Response Body"
                        : "Web Search Briefing"}
                    </p>

                    <div className="text-sm text-foreground/90 leading-relaxed space-y-4 max-w-full overflow-hidden">
                      {selectedOutputNode.output?.error ? (
                        <div className="p-4 rounded-md bg-muted/50 border border-border">
                          <p className="font-semibold text-foreground mb-2">Execution Failed</p>
                          <p className="text-muted-foreground mb-4">{selectedOutputNode.output?.message || "Unknown error"}</p>
                          {selectedOutputNode.output?.traceback && (
                            <pre className="p-4 rounded-md bg-muted text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                              {selectedOutputNode.output.traceback}
                            </pre>
                          )}
                        </div>
                      ) : (
                        (() => {
                          const isHttp = selectedOutputNode.title.toLowerCase().includes("rest") || 
                                         selectedOutputNode.title.toLowerCase().includes("webhook") || 
                                         selectedOutputNode.title.toLowerCase().includes("http");
                          
                          if (isHttp) {
                            const rawBody = selectedOutputNode.output?.response_body || "No response body returned.";
                            let prettyJson = "";
                            try {
                              prettyJson = JSON.stringify(JSON.parse(rawBody), null, 2);
                            } catch {}
                            
                            if (prettyJson) {
                              return (
                                <div className="w-full overflow-hidden rounded-md border border-border bg-muted">
                                  <pre className="w-full p-4 text-xs font-mono text-foreground max-h-96 overflow-x-auto overflow-y-auto whitespace-pre leading-normal custom-thin-scrollbar">
                                    <code>{prettyJson}</code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <div className="w-full overflow-hidden rounded-md border border-border bg-muted">
                                <pre className="w-full p-4 text-xs font-mono text-foreground max-h-96 overflow-x-auto overflow-y-auto whitespace-pre leading-normal custom-thin-scrollbar">
                                  <code>{rawBody}</code>
                                </pre>
                              </div>
                            );
                          }

                          const rawSummary = selectedOutputNode.output?.summary || selectedOutputNode.output?.answer || "Executed successfully. No output generated.";
                          let htmlContent = "";
                          try {
                            htmlContent = marked.parse(rawSummary) as string;
                          } catch (e) {
                            htmlContent = `<p>${rawSummary}</p>`;
                          }
                          return (
                            <div 
                              className="markdown-content text-sm text-foreground/90 leading-normal max-w-full overflow-hidden break-words"
                              dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                          );
                        })()
                      )}
                    </div>
                  </div>
 
                  {/* STATS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <p className={`text-sm font-semibold ${
                        selectedOutputNode.output?.status === "error" || selectedOutputNode.output?.error
                          ? "text-red-500"
                          : "text-emerald-500"
                      }`}>
                        {selectedOutputNode.output?.status === "error" || selectedOutputNode.output?.error ? "Failed" : "Success"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Engine</p>
                      <p className="text-sm font-medium truncate">
                        {selectedOutputNode.output?.model || (selectedOutputNode.output?.results?.length ? `${selectedOutputNode.output.results.length} Sources` : "Default")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Latency</p>
                      <p className="text-sm font-medium">{selectedOutputNode.output?.latency_ms || 0} ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Throughput</p>
                      <p className="text-sm font-medium">
                        {selectedOutputNode.output?.tps ? `${selectedOutputNode.output.tps} TPS` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
 
              {/* TAB: SOURCES */}
              {outputModalTab === "sources" && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sources ({selectedOutputNode.output?.results?.length || 0})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedOutputNode.output?.results || []).map((res: any, idx: number) => {
                      let domain = "web";
                      try { domain = new URL(res.url).hostname; } catch {}
                      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                      return (
                        <div key={idx} className="p-4 rounded-md border border-border flex flex-col justify-between space-y-3 bg-background hover:bg-muted/10 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <img
                                src={faviconUrl}
                                alt={domain}
                                className="w-3.5 h-3.5 object-contain shrink-0 rounded-sm"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span className="text-xs text-muted-foreground truncate">{domain}</span>
                            </div>
                            <a href={res.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline line-clamp-2 text-foreground">
                              {res.title || domain}
                            </a>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-border/40">
                            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Relevance Score: {res.score || "1.0"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: JSON */}
              {outputModalTab === "json" && (
                <div className="w-full overflow-hidden rounded-md border border-border bg-muted">
                  <pre className="w-full p-4 text-xs font-mono text-foreground max-h-96 overflow-x-auto overflow-y-auto whitespace-pre custom-thin-scrollbar">
                    {JSON.stringify(selectedOutputNode.output || { status: "success" }, null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB: LOGS */}
              {outputModalTab === "audit" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Mode</p>
                      <p className="text-sm font-medium truncate">{selectedOutputNode.output?.execution_audit?.execution_mode || "API"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Endpoint</p>
                      <p className="text-sm font-medium truncate">{selectedOutputNode.output?.execution_audit?.endpoint_url || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Key</p>
                      <p className="text-sm font-medium truncate">{selectedOutputNode.output?.execution_audit?.api_key_masked || "Hidden"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Execution Trace</p>
                    <div className="bg-muted p-4 rounded-md border border-border text-xs font-mono max-h-64 overflow-y-auto space-y-2">
                      {(selectedOutputNode.output?.execution_audit?.logs || ["No logs available."]).map((line: string, i: number) => (
                        <div key={i} className="text-muted-foreground leading-relaxed">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
