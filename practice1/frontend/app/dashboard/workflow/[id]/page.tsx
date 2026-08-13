"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  FiMousePointer,
  FiMove,
  FiStopCircle,
  FiSave,
  FiAlertCircle,
  FiMenu
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "@/components/ui/toast";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { saveWorkflowToBackend, connectExecutionWebSocket } from "@/lib/api";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { BrandLogo } from "@/components/canvas/BrandLogo";
import { CanvasHeader } from "@/components/canvas/CanvasHeader";
import { NodeCatalogSidebar } from "@/components/canvas/NodeCatalogSidebar";
import { MobileNodeDrawer } from "@/components/canvas/MobileNodeDrawer";
import { JsonExportDialog } from "@/components/canvas/JsonExportDialog";
import { OutputModal } from "@/components/canvas/OutputModal";
import { CanvasNode, Connection, PaletteNodeDef } from "@/components/canvas/types";
import { LLM_PROVIDERS, PALETTE_CATALOG, CATEGORY_TABS } from "@/components/canvas/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function EmbeddedWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const graphId = params.id as string;
  const [token, setToken] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [mobileDashboardOpen, setMobileDashboardOpen] = useState(false);

  // BOX SELECTION STATE (RUBBERBAND MARQUEE)
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [interactionMode, setInteractionMode] = useState<"pan" | "select">("select");
  const isBoxSelectingRef = useRef(false);

  // INTERACTIVE CONNECT WIRE & PLUS ICON POPOVER STATE
  const [connectingStartNodeId, setConnectingStartNodeId] = useState<string | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);
  const [quickConnectNodeId, setQuickConnectNodeId] = useState<string | null>(null);

  // Helper to check if a connection would introduce a cycle in the DAG (via DFS)
  const wouldCreateCycle = (fromId: string, toId: string, currentConnections: Connection[]): boolean => {
    if (fromId === toId) return true; // Self loop is a cycle of length 1

    const visited = new Set<string>();
    const stack = [toId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === fromId) return true;

      if (!visited.has(current)) {
        visited.add(current);
        const outgoing = currentConnections.filter((c) => c.fromId === current);
        for (const conn of outgoing) {
          if (!visited.has(conn.toId)) {
            stack.push(conn.toId);
          }
        }
      }
    }
    return false;
  };

  const handleConnectNodes = (fromId: string, toId: string) => {
    if (fromId === toId) {
      toast.add({
        title: "Connection Blocked",
        description: "Self-loops are not allowed in the workflow graph.",
        type: "warning",
      });
      return;
    }

    if (wouldCreateCycle(fromId, toId, connections)) {
      toast.add({
        title: "Cycle Prevented",
        description: "Connecting these nodes would create a loop. All workflow paths must be acyclic (DAG).",
        type: "error",
      });
      // Cancel drawing state
      setConnectingStartNodeId(null);
      setConnectingMousePos(null);
      setQuickConnectNodeId(null);
      return;
    }

    if (connections.some((c) => c.fromId === fromId && c.toId === toId)) return;
    setConnections((prev) => [...prev, { id: `c-${Date.now()}`, fromId, toId }]);
    setConnectingStartNodeId(null);
    setConnectingMousePos(null);
    setQuickConnectNodeId(null);
  };

  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(["llm-1"]);
  
  // DRAG STATE FOR SMOOTH 60FPS DRAGGING
  const draggingNodeRef = useRef<{ id: string; startMouseX: number; startMouseY: number; initialPositions: { [key: string]: { x: number; y: number } } } | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [graphName, setGraphName] = useState("nexus_agent_pipeline_v1");
  const [graphDescription, setGraphDescription] = useState("");
  const [jsonExportOpen, setJsonExportOpen] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [nodePropsDialogOpen, setNodePropsDialogOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"params" | "prompt" | "performance" | "guardrails">("params");
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingHTML, setIsGeneratingHTML] = useState(false);
  const [emailLayoutMode, setEmailLayoutMode] = useState<"auto" | "manual">("auto");
  const [restTab, setRestTab] = useState<"headers" | "body" | "auth" | "query">("headers");
  const [restMethodDropdownOpen, setRestMethodDropdownOpen] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const hasLoadedRef = useRef(false);

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

    const checkAuthStatus = async () => {
      const savedToken = localStorage.getItem("nexus-token");
      if (!savedToken) {
        router.push("/login");
        return;
      }
      setToken(savedToken);

      try {
        const authRes = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { "Authorization": `Bearer ${savedToken}` }
        });
        if (!authRes.ok) throw new Error("Unauthorized");
        const authData = await authRes.json();
        if (!authData.is_verified) {
          router.push("/verify-email");
          return;
        }
        if (!authData.onboarded) {
          router.push("/onboarding");
          return;
        }

        // Fetch workflow details from DB
        const wfRes = await fetch(`${API_BASE_URL}/workflows/${graphId}`, {
          headers: { "Authorization": `Bearer ${savedToken}` }
        });
        if (wfRes.ok) {
          const wfData = await wfRes.json();
          setGraphName(wfData.name || "pipeline_flow");
          setGraphDescription(wfData.description || "");
          // Re-map position fields to avoid NaN style coordinates
          const mappedNodes = (wfData.nodes || []).map((n: any) => ({
            ...n,
            // Restore flat x/y from nested position if needed
            x: typeof n.x === "number" ? n.x : (n.position?.x ?? 100),
            y: typeof n.y === "number" ? n.y : (n.position?.y ?? 100),
            status: n.status || "idle",
            iconUrl: n.iconUrl || "",
            colorClass: n.colorClass || "",
            category: n.category || "",
            // Config: spread the full config object (all extra fields preserved via Pydantic extra=allow)
            config: n.config ? { ...n.config } : {},
          }));
          setNodes(mappedNodes);
          // Restore edges / connections
          setConnections((wfData.edges || []).map((e: any) => ({
            id: e.id,
            fromId: e.fromId,
            toId: e.toId,
          })));
          hasLoadedRef.current = true;
        } else {
          router.push("/dashboard");
        }

        setAuthLoading(false);
      } catch (err) {
        localStorage.removeItem("nexus-token");
        router.push("/login");
      }
    };

    checkAuthStatus();
  }, [graphId, router]);

  // LIVE DEBOUNCED AUTOSAVE EFFECT
  useEffect(() => {
    if (!hasLoadedRef.current || authLoading) return;

    setSaveStatusText("SAVING...");
    const delayDebounce = setTimeout(async () => {
      try {
        const payload = {
          graph_id: graphId,
          name: graphName,
          description: graphDescription,
          engine: "nexus_agent_v2",
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            subtitle: n.subtitle || "",
            status: n.status || "idle",
            iconUrl: n.iconUrl || "",
            colorClass: n.colorClass || "",
            category: n.category || "",
            config: n.config,
            position: { x: Math.round(n.x), y: Math.round(n.y) },
          })),
          edges: connections,
        };

        const res = await saveWorkflowToBackend(payload);
        if (res) {
          setSaveStatusText("SAVED");
        } else {
          setSaveStatusText("SAVE ERROR");
        }
      } catch (err) {
        console.warn("Autosave failed:", err);
        setSaveStatusText("SAVE ERROR");
      }
    }, 1500); // 1.5s debounce to keep it light and responsive

    return () => clearTimeout(delayDebounce);
  }, [nodes, connections, graphName, graphDescription, authLoading, graphId]);

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

  // RICH 40+ SHADCN-FIRST TOOL CATALOG
  const paletteCatalog: PaletteNodeDef[] = [
    // Triggers
    { type: "trigger", title: "Webhook Trigger", subtitle: "HTTP Event Endpoint", category: "Triggers", iconUrl: "https://svgl.app/library/postman.svg", colorClass: "" },
    { type: "trigger", title: "Cron Schedule", subtitle: "Interval Scheduler", category: "Triggers", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/clockify.svg", colorClass: "" },
    { type: "trigger", title: "Gmail Listener (Incoming)", subtitle: "Fires on new unread email", category: "Triggers", iconUrl: "https://svgl.app/library/gmail.svg", colorClass: "" },
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
    { type: "app", title: "Gmail Sender (Outgoing)", subtitle: "Send outbound HTML email", category: "Apps & APIs", iconUrl: "https://svgl.app/library/gmail.svg", colorClass: "" },

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

  // NON-PASSIVE CANVAS WHEEL ZOOM ENGINE
  useEffect(() => {
    const handleCanvasWheel = (e: WheelEvent) => {
      const container = canvasContainerRef.current;
      if (!container) return;
      
      const target = e.target as Node | null;
      if (target && container.contains(target)) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoomLevel((prev) => Math.min(2.0, Math.max(0.4, prev * zoomFactor)));
      }
    };

    window.addEventListener("wheel", handleCanvasWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleCanvasWheel);
    };
  }, []);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if we are typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeIds.length > 0) {
        handleDeleteSelectedNodes();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeIds]);

  // CANVAS PANNING OR RUBBERBAND MARQUEE SELECTION
  const handleMainPointerDown = (e: React.PointerEvent) => {
    // ALWAYS clear active connections if you click on the background canvas
    if (connectingStartNodeId) {
      setConnectingStartNodeId(null);
      setConnectingMousePos(null);
      setQuickConnectNodeId(null);
    }

    const isTouch = e.pointerType === "touch";
    if (e.button === 1 || (e.ctrlKey && e.button === 0) || isTouch || (e.button === 0 && interactionMode === "pan")) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      if (!e.shiftKey) {
        setSelectedNodeIds([]);
      }
    } else if (e.button === 0 && interactionMode === "select") {
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
    
    // Clear active connection drag if clicking on a node (but not the input handle)
    if (connectingStartNodeId) {
      setConnectingStartNodeId(null);
      setConnectingMousePos(null);
      setQuickConnectNodeId(null);
    }

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
      // 1. Smooth wire dragging if connecting
      if (connectingStartNodeId) {
        const rect = canvasContainerRef.current?.getBoundingClientRect();
        if (rect) {
          const canvasX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
          const canvasY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
          setConnectingMousePos({ x: canvasX, y: canvasY });
        }
      }

      // 2. Node card dragging without artificial boundary trapping
      if (!draggingNodeRef.current) return;
      const { startMouseX, startMouseY, initialPositions } = draggingNodeRef.current;
      
      const dx = (e.clientX - startMouseX) / zoomLevel;
      const dy = (e.clientY - startMouseY) / zoomLevel;

      setNodes((prev) =>
        prev.map((n) => {
          if (initialPositions[n.id]) {
            const newX = initialPositions[n.id].x + dx;
            const newY = initialPositions[n.id].y + dy;
            return { ...n, x: newX, y: newY };
          }
          return n;
        })
      );
    };

    const handlePointerUp = (e: PointerEvent) => {
      draggingNodeRef.current = null;

      if (connectingStartNodeId) {
        // Find if the wire was released directly over an input handle or a node card
        const element = document.elementFromPoint(e.clientX, e.clientY);
        let targetNodeId = element?.closest("[data-input-handle-node-id]")?.getAttribute("data-input-handle-node-id");
        
        if (!targetNodeId) {
          const card = element?.closest("[data-node-card-id]");
          if (card) {
            const nodeId = card.getAttribute("data-node-card-id");
            const targetNode = nodes.find((n) => n.id === nodeId);
            // Allow connecting to any node that is not a trigger
            if (targetNode && targetNode.type !== "trigger") {
              targetNodeId = nodeId;
            }
          }
        }

        if (targetNodeId && targetNodeId !== connectingStartNodeId) {
          handleConnectNodes(connectingStartNodeId, targetNodeId);
        }
        
        setConnectingStartNodeId(null);
        setConnectingMousePos(null);
        setQuickConnectNodeId(null);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [zoomLevel, panOffset, connectingStartNodeId, nodes]);

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
      category: item.category,
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
      graph_id: graphId,
      name: graphName,
      description: graphDescription,
      engine: "nexus_agent_v2",
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        subtitle: n.subtitle || "",
        status: n.status || "idle",
        iconUrl: n.iconUrl || "",
        colorClass: n.colorClass || "",
        category: n.category || "",
        config: n.config,
        position: { x: Math.round(n.x), y: Math.round(n.y) },
      })),
      edges: connections,
    };

    const res = await saveWorkflowToBackend(payload);
    setIsSaving(false);
    if (res) {
      setSaveStatusText("SAVED TO MONGO");
      setTimeout(() => setSaveStatusText("SAVED"), 3000);
    }
  };

  // Generate Email HTML with Groq via backend endpoint
  const handleGenerateEmailHTML = async (nodeId: string) => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingHTML(true);

    // Get upstream connections to list variables for Groq context mapping
    const upstreamConns = connections.filter(c => c.toId === nodeId);
    const upstreamNodes = upstreamConns
      .map(c => nodes.find(n => n.id === c.fromId))
      .filter(Boolean) as CanvasNode[];

    const variables = upstreamNodes.map(n => ({
      id: n.id,
      title: n.title,
      subtitle: n.subtitle || "",
      output: n.output
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/workflows/generate-html`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: aiPrompt, variables })
      });
      if (res.ok) {
        const data = await res.json();
        setNodes(prev => prev.map(n =>
          n.id === nodeId ? { ...n, config: { ...n.config, bodyHtml: data.html } } : n
        ));
        setAiPrompt("");
      } else {
        const err = await res.json();
        alert(`Failed to generate email layout: ${err.detail || "API Error"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to AI email generator service.");
    } finally {
      setIsGeneratingHTML(false);
    }
  };

  // Auto-generate Email HTML from canvas context (no prompting needed)
  const handleAutoGenerateHTMLFromContext = async (nodeId: string) => {
    setIsGeneratingHTML(true);

    // Get upstream connections to list variables for Groq context mapping
    const upstreamConns = connections.filter(c => c.toId === nodeId);
    const upstreamNodes = upstreamConns
      .map(c => nodes.find(n => n.id === c.fromId))
      .filter(Boolean) as CanvasNode[];

    const variables = upstreamNodes.map(n => ({
      id: n.id,
      title: n.title,
      subtitle: n.subtitle || "",
      output: n.output
    }));

    // Auto-build prompt based on upstream nodes context
    let contextDesc = "";
    if (upstreamNodes.length > 0) {
      contextDesc = `This email alert is triggered when new data arrives from ${upstreamNodes.map(n => `'${n.title}'`).join(", ")}. `;
    } else {
      contextDesc = "This is a generic workflow notification email. ";
    }

    const autoPrompt = (
      `Generate a beautiful, premium, dark-mode email notification layout. ` +
      `${contextDesc}Make sure to include a clear header, a summary card presenting the dynamic outputs using the exact placeholders, ` +
      `and a clean footer. Use modern spacing, nice contrast, rounded corners, and zinc-800 style borders.`
    );

    try {
      const res = await fetch(`${API_BASE_URL}/workflows/generate-html`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: autoPrompt, variables })
      });
      if (res.ok) {
        const data = await res.json();
        setNodes(prev => prev.map(n =>
          n.id === nodeId ? { ...n, config: { ...n.config, bodyHtml: data.html } } : n
        ));
      } else {
        const err = await res.json();
        alert(`Auto-generation failed: ${err.detail || "API Error"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to AI email generator service.");
    } finally {
      setIsGeneratingHTML(false);
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
      graphId,
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
    <div className="min-h-screen w-full bg-background text-foreground flex font-sans overflow-hidden select-none">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <div className="hidden lg:flex shrink-0 z-20 relative">
        <DashboardSidebar
          activeTab="workflows"
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* 1.5 MOBILE DASHBOARD DRAWER */}
      <AnimatePresence>
        {mobileDashboardOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDashboardOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden cursor-pointer"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden shadow-xl"
            >
              <DashboardSidebar
                activeTab="workflows"
                collapsed={false}
                onToggleCollapse={() => {}}
                isMobileDrawer={true}
                onCloseMobile={() => setMobileDashboardOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. CANVAS VIEWPORT */}
      <main className="flex-1 h-screen flex flex-col justify-start relative overflow-hidden bg-background">
        <div
          onClick={() => setContextMenu({ visible: false, x: 0, y: 0, nodeId: "" })}
          className="h-full w-full bg-background text-foreground flex flex-col font-sans overflow-hidden select-none"
        >
      
      <CanvasHeader
        graphId={graphId}
        graphName={graphName}
        setGraphName={setGraphName}
        graphDescription={graphDescription}
        setGraphDescription={setGraphDescription}
        saveStatusText={saveStatusText}
        isSaving={isSaving}
        isRunning={isRunning}
        theme={theme}
        onSave={handleSaveWorkflow}
        onRun={runSimulation}
        onReset={resetSimulation}
        onToggleTheme={toggleTheme}
        onExportAST={() => setJsonExportOpen(true)}
        onOpenMobileCatalog={() => setMobileCatalogOpen(true)}
        onOpenMobileDashboard={() => setMobileDashboardOpen(true)}
      />

      {/* 2. MAIN BUILDER BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        
        <NodeCatalogSidebar
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          filteredCatalog={filteredCatalog}
          categoryTabs={CATEGORY_TABS}
          onAddNode={handleAddNode}
          paletteCatalog={PALETTE_CATALOG}
        />

        {/* FULL-WIDTH RESPONSIVE CANVAS */}
        <main
          ref={canvasContainerRef}
          onPointerDown={handleMainPointerDown}
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
          {/* FLOATING CANVAS CONTROLS */}
          <div className="absolute right-3 top-3 sm:right-6 sm:top-6 z-30 flex flex-col items-end gap-2">
            
            {/* Interaction Tools */}
            <div className="flex items-center gap-1.5 bg-background border border-border p-1 rounded-md shadow-md font-sans">
              <Button
                variant={interactionMode === "select" ? "default" : "ghost"}
                size="icon"
                onClick={() => setInteractionMode("select")}
                className={`h-7 w-7 rounded-sm text-xs cursor-pointer ${interactionMode === "select" ? "bg-primary text-primary-foreground" : ""}`}
                title="Select Tool (V)"
              >
                <FiMousePointer className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={interactionMode === "pan" ? "default" : "ghost"}
                size="icon"
                onClick={() => setInteractionMode("pan")}
                className={`h-7 w-7 rounded-sm text-xs cursor-pointer ${interactionMode === "pan" ? "bg-primary text-primary-foreground" : ""}`}
                title="Pan Tool (H)"
              >
                <FiMove className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-background border border-border p-1 rounded-md shadow-md font-sans">
              <Button variant="ghost" size="icon" onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.1))} className="h-7 w-7 rounded-sm text-xs font-semibold cursor-pointer">
                +
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.1))} className="h-7 w-7 rounded-sm text-xs font-semibold cursor-pointer">
                -
              </Button>
              
              <div className="h-4 w-px bg-border" />

              <button
                onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                className="text-[10px] font-medium text-foreground hover:underline px-1 cursor-pointer"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            </div>
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
            {/* SVG BEZIER CURVES — positioned absolutely to match node coordinate space */}
            <svg
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 1 }}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--foreground)" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
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

                const dx = Math.max(Math.abs(x2 - x1) * 0.6, 60);
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const isEdgeActive =
                  (source.status === "running" || source.status === "success") &&
                  (target.status === "running" || target.status === "success");

                return (
                  <g key={conn.id} className="group cursor-pointer">
                    {/* HIT AREA FOR EASY CLICKING/DISCONNECTING */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handleDelinkConnection(conn.id);
                      }}
                      className="pointer-events-auto cursor-pointer"
                    />

                    {/* VISIBLE CONNECTION LINE */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isEdgeActive ? "#f97316" : "var(--foreground)"}
                      strokeWidth={isEdgeActive ? "3.5" : "2.5"}
                      strokeOpacity={isEdgeActive ? "1" : "0.85"}
                      markerEnd={isEdgeActive ? "url(#arrow-active)" : "url(#arrow)"}
                      className={`pointer-events-none transition-colors ${isEdgeActive ? "animate-flow-line" : "group-hover:stroke-red-500 group-hover:stroke-opacity-100"}`}
                    />

                    {/* MIDPOINT DELETE BADGE ON HOVER */}
                    <g
                      transform={`translate(${midX - 10}, ${midY - 10})`}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handleDelinkConnection(conn.id);
                      }}
                      className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Click to remove connection"
                    >
                      <rect width="20" height="20" rx="6" fill="#ef4444" />
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

                const dx = Math.max(Math.abs(x2 - x1) * 0.6, 60);
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                return (
                  <g className="pointer-events-none z-50">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="4"
                      strokeDasharray="6 6"
                      className="animate-pulse"
                    />
                    <circle cx={x2} cy={y2} r="7" fill="#f97316" className="animate-ping opacity-75" />
                    <circle cx={x2} cy={y2} r="5" fill="#f97316" />
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
                    data-node-card-id={node.id}
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
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className={`absolute -top-2 -right-2 w-5 h-5 rounded-md bg-destructive text-destructive-foreground flex items-center justify-center transition-opacity shadow-sm hover:bg-destructive/90 cursor-pointer z-40 ${
                        isSelected ? "opacity-100" : "opacity-0 group-hover/card:opacity-100"
                      }`}
                      title="Delete Node"
                    >
                      <FiX className="h-3 w-3" />
                    </button>

                    {/* INPUT HANDLE */}
                    {node.type !== "trigger" && (
                      <button
                        type="button"
                        data-input-handle-node-id={node.id}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (connectingStartNodeId) {
                            if (connectingStartNodeId === node.id) {
                              setConnectingStartNodeId(null);
                              setQuickConnectNodeId(null);
                            } else {
                              handleConnectNodes(connectingStartNodeId, node.id);
                            }
                          } else {
                            // If already connected, disconnect incoming connections on click
                            const incoming = connections.filter((c) => c.toId === node.id);
                            if (incoming.length > 0) {
                              setConnections((prev) => prev.filter((c) => c.toId !== node.id));
                            }
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
                        title={connectingStartNodeId ? "Click to Complete Connection" : "Input Handle (Click to disconnect incoming)"}
                      />
                    )}

                    {/* OUTPUT HANDLE */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center z-40">
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (connectingStartNodeId === node.id) {
                            setConnectingStartNodeId(null);
                            setConnectingMousePos(null);
                            setQuickConnectNodeId(null);
                          } else {
                            const rect = canvasContainerRef.current?.getBoundingClientRect();
                            if (rect) {
                              const canvasX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
                              const canvasY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
                              setConnectingStartNodeId(node.id);
                              setConnectingMousePos({ x: canvasX, y: canvasY });
                              setQuickConnectNodeId(quickConnectNodeId === node.id ? null : node.id);
                            }
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className={`w-4 h-4 rounded-full border bg-background flex items-center justify-center cursor-crosshair transition-all ${
                          connectingStartNodeId === node.id
                            ? "border-amber-500 bg-amber-500 text-white scale-125 ring-2 ring-amber-500/30"
                            : "border-muted-foreground hover:border-amber-500"
                        }`}
                        title="Click or Drag to Connect"
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNodeIds([node.id]);
                                setNodePropsDialogOpen(true);
                              }}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Configure Node"
                            >
                              <FiSettings className="h-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={(e) => toggleNodeCollapse(node.id, e)} className="text-muted-foreground hover:text-foreground">
                            <FiChevronDown className="h-4 w-4" />
                          </button>
                        </div>
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

      <MobileNodeDrawer
        open={mobileCatalogOpen}
        onOpenChange={setMobileCatalogOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCatalog={filteredCatalog}
        onAddNode={handleAddNode}
      />

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

                  {/* GMAIL LISTENER TRIGGER PARAMS */}
                  {primarySelectedNode.type === "trigger" && primarySelectedNode.title.toLowerCase().includes("gmail") && (
                    <div className="space-y-5">

                      {/* Auto-credential status */}
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5">
                        <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Credentials auto-sourced</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                            Gmail address &amp; App Password are automatically pulled from your saved
                            <span className="text-foreground font-medium"> API Credentials → Gmail Listener</span> at execution time. No need to enter them here.
                          </p>
                        </div>
                      </div>

                      {/* Sender Filter */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                          Filter — From Address
                          <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          value={primarySelectedNode.config.filterFrom || ""}
                          onChange={e =>
                            setNodes(prev => prev.map(n =>
                              n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, filterFrom: e.target.value } } : n
                            ))
                          }
                          placeholder="alerts@stripe.com"
                          className="h-9 text-xs bg-background border-border text-foreground"
                        />
                        <p className="text-[10px] text-muted-foreground">Only trigger when emails arrive from this sender. Leave blank to trigger on all.</p>
                      </div>

                      {/* Subject Filter */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                          Filter — Subject Contains
                          <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          value={primarySelectedNode.config.filterSubject || ""}
                          onChange={e =>
                            setNodes(prev => prev.map(n =>
                              n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, filterSubject: e.target.value } } : n
                            ))
                          }
                          placeholder="invoice, payment failed, alert"
                          className="h-9 text-xs bg-background border-border text-foreground"
                        />
                        <p className="text-[10px] text-muted-foreground">Comma-separated keywords. Trigger fires only when subject matches any keyword.</p>
                      </div>

                      {/* Poll Interval */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Poll Interval
                          </Label>
                          <span className="text-[10px] font-mono text-foreground">
                            every {primarySelectedNode.config.pollIntervalSec || 60}s
                          </span>
                        </div>
                        <input
                          type="range"
                          min={15}
                          max={300}
                          step={15}
                          value={primarySelectedNode.config.pollIntervalSec || 60}
                          onChange={e =>
                            setNodes(prev => prev.map(n =>
                              n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, pollIntervalSec: parseInt(e.target.value) } } : n
                            ))
                          }
                          className="w-full accent-primary cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                          <span>15s</span><span>1m</span><span>2m</span><span>5m</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">How frequently to check the inbox for new unread messages.</p>
                      </div>

                      {/* Mark as read */}
                      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-foreground">Mark as Read After Trigger</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Automatically marks the email as read once the pipeline fires.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setNodes(prev => prev.map(n =>
                              n.id === primarySelectedNode.id
                                ? { ...n, config: { ...n.config, markAsRead: !(primarySelectedNode.config as any).markAsRead } }
                                : n
                            ))
                          }
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                            (primarySelectedNode.config as any).markAsRead ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              (primarySelectedNode.config as any).markAsRead ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
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
                  {primarySelectedNode.type === "app" && (() => {
                    const titleLower = primarySelectedNode.title.toLowerCase();
                    const isGmailSender = titleLower.includes("gmail sender") || titleLower.includes("send email") || titleLower.includes("email sender");

                    // Collect upstream nodes for variable chips
                    const upstreamConns = connections.filter(c => c.toId === primarySelectedNode.id);
                    const upstreamNodes = upstreamConns
                      .map(c => nodes.find(n => n.id === c.fromId))
                      .filter(Boolean) as CanvasNode[];

                    const insertIntoField = (field: "subject" | "bodyHtml", varToken: string) => {
                      const curr = (primarySelectedNode.config[field] || "") as string;
                      setNodes(prev => prev.map(n =>
                        n.id === primarySelectedNode.id
                          ? { ...n, config: { ...n.config, [field]: curr + varToken } }
                          : n
                      ));
                    };

                    if (isGmailSender) {
                      return (
                        <div className="space-y-5">
                          {/* Upstream context chips */}
                          {upstreamNodes.length > 0 && (
                            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available Context Variables</p>
                              <p className="text-[10px] text-muted-foreground">Click to insert into Subject or Body. Use <code className="bg-muted px-1 rounded text-[9px]">{'{{upstream_output}}'}</code> for all upstream content combined.</p>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {upstreamNodes.map(n => (
                                  <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => insertIntoField("bodyHtml", `{{${n.id}}}`)}
                                    className="text-[10px] px-2 py-1 rounded-md bg-primary/10 border border-primary/25 text-primary font-mono cursor-pointer hover:bg-primary/20 transition-colors"
                                  >
                                    {`{{${n.id}}}`}
                                    <span className="ml-1 text-muted-foreground font-sans">({n.title})</span>
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => insertIntoField("bodyHtml", `{{upstream_output}}`)}
                                  className="text-[10px] px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-400 font-mono cursor-pointer hover:bg-purple-500/20 transition-colors"
                                >
                                  {'{{upstream_output}}'}
                                  <span className="ml-1 text-muted-foreground font-sans">(all nodes merged)</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Sender credentials info */}
                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">SMTP Credentials</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              Sender email &amp; SMTP App Password are pulled from your saved API Credentials. Go to
                              <span className="text-foreground font-medium"> Dashboard → API Credentials → Gmail Sender</span> to configure them.
                            </p>
                          </div>

                          {/* Recipients */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Recipients <span className="text-red-400">*</span></Label>
                            <Input
                              value={primarySelectedNode.config.recipients || ""}
                              onChange={e =>
                                setNodes(prev => prev.map(n =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, recipients: e.target.value } } : n
                                ))
                              }
                              placeholder="alice@example.com, bob@company.com"
                              className="h-9 text-xs bg-background border-border text-foreground"
                            />
                            <p className="text-[10px] text-muted-foreground">Comma-separated list of recipient email addresses.</p>
                          </div>

                          {/* Subject */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Email Subject</Label>
                              <button
                                type="button"
                                onClick={() => insertIntoField("subject", "{{upstream_output}}")}
                                className="text-[10px] text-primary hover:underline cursor-pointer"
                              >Insert variable</button>
                            </div>
                            <Input
                              value={primarySelectedNode.config.subject || ""}
                              onChange={e =>
                                setNodes(prev => prev.map(n =>
                                  n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, subject: e.target.value } } : n
                                ))
                              }
                              placeholder="Pipeline Alert: {{upstream_output}}"
                              className="h-9 text-xs font-mono bg-background border-border text-foreground"
                            />
                          </div>

                           {/* Visual Customization controls */}
                           <div className="space-y-4 pt-3 border-t border-border">
                             <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Styling Options</p>
                             
                             {/* Theme Toggle */}
                             <div className="space-y-1.5">
                               <Label className="text-[11px] font-semibold text-muted-foreground">Email Theme Mode</Label>
                               <div className="flex bg-muted/60 p-0.5 rounded-md border border-border w-fit">
                                 <button
                                   type="button"
                                   onClick={() =>
                                     setNodes(prev => prev.map(n =>
                                       n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, theme: "dark" } } : n
                                     ))
                                   }
                                   className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors cursor-pointer ${
                                     (primarySelectedNode.config.theme || "dark") === "dark"
                                       ? "bg-background text-foreground shadow-2xs"
                                       : "text-muted-foreground hover:text-foreground"
                                   }`}
                                 >
                                   Dark Mode
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() =>
                                     setNodes(prev => prev.map(n =>
                                       n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, theme: "light" } } : n
                                     ))
                                   }
                                   className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors cursor-pointer ${
                                     (primarySelectedNode.config.theme || "dark") === "light"
                                       ? "bg-background text-foreground shadow-2xs"
                                       : "text-muted-foreground hover:text-foreground"
                                   }`}
                                 >
                                   Light Theme
                                 </button>
                               </div>
                             </div>

                             {/* Accent Color picker */}
                             <div className="space-y-2">
                               <Label className="text-[11px] font-semibold text-muted-foreground block">Accent Brand Color</Label>
                               <div className="flex flex-wrap items-center gap-2.5">
                                 {[
                                   { name: "Violet", hex: "#7c3aed" },
                                   { name: "Indigo", hex: "#4f46e5" },
                                   { name: "Blue", hex: "#3b82f6" },
                                   { name: "Emerald", hex: "#10b981" },
                                   { name: "Rose", hex: "#f43f5e" },
                                   { name: "Amber", hex: "#f59e0b" },
                                   { name: "Slate", hex: "#64748b" }
                                 ].map((c) => {
                                   const isSelected = (primarySelectedNode.config.accentColor || "#7c3aed") === c.hex;
                                   return (
                                     <button
                                       key={c.hex}
                                       type="button"
                                       title={c.name}
                                       onClick={() =>
                                         setNodes(prev => prev.map(n =>
                                           n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, accentColor: c.hex } } : n
                                         ))
                                       }
                                       style={{ backgroundColor: c.hex }}
                                       className={`w-6 h-6 rounded-full cursor-pointer transition-all flex items-center justify-center ${
                                         isSelected ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110" : "opacity-80 hover:opacity-100"
                                       }`}
                                     >
                                       {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                                     </button>
                                   );
                                 })}
                                 
                                 <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                                   <input
                                     type="color"
                                     value={primarySelectedNode.config.accentColor || "#7c3aed"}
                                     onChange={e =>
                                       setNodes(prev => prev.map(n =>
                                         n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, accentColor: e.target.value } } : n
                                       ))
                                     }
                                     className="w-7 h-7 rounded cursor-pointer border border-border bg-background p-0.5"
                                     title="Choose custom color"
                                   />
                                   <span className="text-[10px] font-mono text-muted-foreground">{primarySelectedNode.config.accentColor || "#7c3aed"}</span>
                                 </div>
                               </div>
                             </div>

                             {/* Additional content */}
                             <div className="space-y-1.5">
                               <div className="flex items-center justify-between">
                                 <Label className="text-[11px] font-semibold text-muted-foreground">Additional Custom Message</Label>
                                 <span className="text-[9px] text-muted-foreground">Markdown &amp; tokens supported</span>
                               </div>
                               <textarea
                                 value={primarySelectedNode.config.additionalContent || ""}
                                 onPointerDown={e => e.stopPropagation()}
                                 onKeyDown={e => e.stopPropagation()}
                                 onChange={e =>
                                   setNodes(prev => prev.map(n =>
                                     n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, additionalContent: e.target.value } } : n
                                   ))
                                 }
                                 placeholder="e.g. Best regards,\nThe DevOps Team.\n\nVisit dashboard: http://example.com"
                                 rows={4}
                                 className="w-full p-2.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:border-foreground leading-relaxed text-foreground cursor-text resize-none font-sans"
                               />
                               <p className="text-[9px] text-muted-foreground leading-normal mt-1">
                                 Available tokens: <code className="bg-muted px-1.5 py-0.5 rounded text-[8px] font-mono">{'{{upstream_output}}'}</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-[8px] font-mono">{'{{timestamp}}'}</code>
                                 {upstreamNodes.length > 0 && (
                                   <>
                                     , and specific node outputs: {upstreamNodes.map((n) => (
                                       <code key={n.id} className="bg-muted px-1.5 py-0.5 rounded text-[8px] font-mono mx-0.5">{`{{${n.id}}}`}</code>
                                     ))}
                                   </>
                                 )}
                                 .
                               </p>
                             </div>
                           </div>
                        </div>
                      );
                    }

                    // Default generic app connector panel
                    return (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Access Token / Incoming Webhook URL</Label>
                          <Input
                            type="password"
                            value={primarySelectedNode.config.appToken || ""}
                            onChange={e =>
                              setNodes(prev => prev.map(n =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, appToken: e.target.value } } : n
                              ))
                            }
                            placeholder="https://hooks.slack.com/services/T00/B00/X00"
                            className="h-9 text-xs font-mono bg-background border-border text-foreground"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Target Channel / Destination ID</Label>
                          <Input
                            value={primarySelectedNode.config.appDestination || ""}
                            onChange={e =>
                              setNodes(prev => prev.map(n =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, appDestination: e.target.value } } : n
                              ))
                            }
                            placeholder="#ai-pipeline-alerts"
                            className="h-9 text-xs bg-background border-border text-foreground"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Rich Message Template</Label>
                          <textarea
                            value={primarySelectedNode.config.appTemplate || ""}
                            onPointerDown={e => e.stopPropagation()}
                            onKeyDown={e => e.stopPropagation()}
                            onChange={e =>
                              setNodes(prev => prev.map(n =>
                                n.id === primarySelectedNode.id ? { ...n, config: { ...n.config, appTemplate: e.target.value } } : n
                              ))
                            }
                            placeholder="🚨 *Pipeline Execution Success!*\nWorkflow ID: {{graph_id}}\nOutput:\n```\n{{llm-1.output}}\n```"
                            className="w-full h-28 p-3 text-xs bg-muted/30 border border-border rounded-md font-mono focus:outline-none focus:border-foreground leading-relaxed text-foreground cursor-text"
                          />
                        </div>
                      </div>
                    );
                  })()}
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

      <JsonExportDialog
        open={jsonExportOpen}
        onOpenChange={setJsonExportOpen}
        graphJson={graphJson}
      />

      <OutputModal
        open={outputModalOpen}
        onOpenChange={setOutputModalOpen}
        selectedOutputNode={selectedOutputNode}
      />

      <Toaster />
        </div>
      </main>
    </div>
  );
}
