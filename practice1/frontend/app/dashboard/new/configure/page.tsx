"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiZap,
  FiPlay,
  FiCpu,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Template {
  id: string;
  name: string;
  desc: string;
  category: string;
  techStack: string[];
  nodes: any[];
  edges: any[];
}

const TEMPLATES: Template[] = [
  {
    id: "tmpl_customer_sentiment",
    name: "Customer Support Sentiment Routing",
    desc: "Analyzes customer feedback sentiment with LLM nodes and alerts Slack channels for negative feedback.",
    category: "Support & CRM",
    techStack: ["OpenAI GPT", "Slack Bot", "REST API"],
    nodes: [
      { id: "trigger-1", type: "trigger", title: "Customer Review Webhook", subtitle: "HTTP Post Listener", x: 40, y: 120, config: { webhookUrl: "/api/v1/webhooks/review-in" } },
      { id: "llm-1", type: "llm", title: "OpenAI GPT & o3", subtitle: "Sentiment classifier", x: 300, y: 120, config: { model: "gpt-4o", prompt: "Identify review sentiment. Respond with exactly POSITIVE or NEGATIVE." } },
      { id: "app-1", type: "app", title: "Slack Bot", subtitle: "Notify Negative Sentiment", x: 560, y: 120, config: { webhookUrl: "https://hooks.slack.com/services/..." } }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "llm-1" },
      { id: "c2", fromId: "llm-1", toId: "app-1" }
    ]
  },
  {
    id: "tmpl_lead_enrichment",
    name: "HubSpot Lead Multi-Agent Enrichment",
    desc: "Fires on new HubSpot contact creation, queries Tavily for LinkedIn details, and updates the contact bio.",
    category: "Sales & Marketing",
    techStack: ["HubSpot CRM", "Tavily Search", "Anthropic Claude"],
    nodes: [
      { id: "trigger-1", type: "trigger", title: "HubSpot Contact Event", subtitle: "New Lead Created", x: 40, y: 120, config: { webhookUrl: "/api/v1/webhooks/hubspot-new" } },
      { id: "tool-1", type: "tool", title: "Tavily Search", subtitle: "LinkedIn Research", x: 280, y: 80, config: { apiKey: "" } },
      { id: "llm-1", type: "llm", title: "Anthropic Claude", subtitle: "Bio Summarizer", x: 520, y: 120, config: { model: "claude-3-5-sonnet", prompt: "Synthesize target career bio based on search results." } },
      { id: "app-1", type: "app", title: "HubSpot CRM", subtitle: "Update Bio Column", x: 760, y: 120, config: { apiKey: "" } }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "tool-1" },
      { id: "c2", fromId: "tool-1", toId: "llm-1" },
      { id: "c3", fromId: "llm-1", toId: "app-1" }
    ]
  },
  {
    id: "tmpl_stripe_recovery",
    name: "Stripe Billing Churn Failed Pay Recovery",
    desc: "Catches Stripe failed pay webhook events, generates friendly recovery emails, and logs to Notion.",
    category: "Billing & Finance",
    techStack: ["Stripe Event", "OpenAI GPT", "Notion Sync"],
    nodes: [
      { id: "trigger-1", type: "trigger", title: "Stripe Event", subtitle: "invoice.payment_failed", x: 40, y: 120, config: { webhookUrl: "/api/v1/webhooks/stripe-failed" } },
      { id: "llm-1", type: "llm", title: "OpenAI GPT & o3", subtitle: "Draft recovery email", x: 300, y: 120, config: { model: "gpt-4o", prompt: "Draft a polite email asking to update payment details." } },
      { id: "app-1", type: "app", title: "Notion Sync", subtitle: "Log failed payment row", x: 560, y: 120, config: { apiKey: "" } }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "llm-1" },
      { id: "c2", fromId: "llm-1", toId: "app-1" }
    ]
  },
  {
    id: "tmpl_email_spam",
    name: "AI Email Spam & Priority Organizer",
    desc: "Watches incoming business mail and files them into priority buckets using an LLM classifier.",
    category: "Operations",
    techStack: ["Gmail Listener", "Groq LPU Engine"],
    nodes: [
      { id: "trigger-1", type: "trigger", title: "Gmail Listener", subtitle: "New Inbox Message", x: 40, y: 120, config: { email: "", password: "" } },
      { id: "llm-1", type: "llm", title: "Groq LPU Engine", subtitle: "Priority tagger", x: 300, y: 120, config: { model: "llama3-70b-8192", prompt: "Classify priority: HIGH, MEDIUM, LOW, or SPAM." } }
    ],
    edges: [{ id: "c1", fromId: "trigger-1", toId: "llm-1" }]
  },
  {
    id: "tmpl_agent_rag",
    name: "Multi-Agent Vector Knowledge RAG Search",
    desc: "Receives user API queries, embeds with Pinecone, runs LLM reasoning, and replies via REST.",
    category: "Developer Tools",
    techStack: ["REST API Client", "Pinecone Vector", "Anthropic Claude"],
    nodes: [
      { id: "trigger-1", type: "trigger", title: "REST API Client", subtitle: "User Search Query", x: 40, y: 120, config: { webhookUrl: "/api/v1/webhooks/search" } },
      { id: "memory-1", type: "memory", title: "Pinecone Vector", subtitle: "Vector Query Match", x: 300, y: 120, config: { apiKey: "" } },
      { id: "llm-1", type: "llm", title: "Anthropic Claude", subtitle: "Draft RAG response", x: 560, y: 120, config: { model: "claude-3-5-sonnet", prompt: "Synthesize answer based on vector matches." } }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "memory-1" },
      { id: "c2", fromId: "memory-1", toId: "llm-1" }
    ]
  }
];

const ENGINES = [
  {
    id: "nexus_agent_v2",
    label: "Nexus Agent v2",
    badge: "Recommended",
    desc: "Latest generation — parallel node execution, smart retry, full observability.",
  },
  {
    id: "nexus_agent_v1",
    label: "Nexus Agent v1",
    badge: "Stable",
    desc: "Proven sequential runner — best for simple linear pipelines.",
  },
  {
    id: "nexus_sandbox_v3",
    label: "Nexus Sandbox v3",
    badge: "Experimental",
    desc: "Raw execution mode — no guardrails, direct node invocation.",
  },
];

function ConfigurePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  const [token, setToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("My Blank Workflow");
  const [description, setDescription] = useState("");
  const [engine, setEngine] = useState("nexus_agent_v2");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("nexus-token");
    if (!savedToken) { router.push("/login"); return; }
    setToken(savedToken);

    if (templateId) {
      const found = TEMPLATES.find(t => t.id === templateId);
      if (found) {
        setSelectedTemplate(found);
        setName(found.name);
        setDescription(found.desc);
      }
    }
    setAuthLoading(false);
  }, [router, templateId]);

  useEffect(() => {
    const saved = localStorage.getItem("nexus-theme");
    document.documentElement.classList.toggle("dark", (saved || "dark") === "dark");
  }, []);

  const handleLaunch = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    const newGraphId = `wf_${Date.now()}`;

    const basePayload = {
      graph_id: newGraphId,
      name: name.trim(),
      description: description.trim(),
      engine,
      concurrency_limit: 5,
      timeout_sec: 300,
      logging_level: "INFO",
      alert_webhook: "",
    };

    const payload = selectedTemplate
      ? {
          ...basePayload,
          nodes: selectedTemplate.nodes.map(n => ({
            id: n.id, type: n.type, title: n.title,
            subtitle: n.subtitle, config: n.config,
            position: { x: n.x ?? 100, y: n.y ?? 100 },
          })),
          edges: selectedTemplate.edges,
        }
      : {
          ...basePayload,
          nodes: [{
            id: "trigger-1", type: "trigger",
            title: "Webhook Trigger", subtitle: "HTTP Event Listener",
            status: "idle", config: { webhookUrl: "/api/v1/webhooks/trigger-1" },
            position: { x: 100, y: 160 },
          }],
          edges: [],
        };

    try {
      const res = await fetch(`${API_BASE_URL}/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push(`/dashboard/workflow/${newGraphId}`);
    } catch (err) {
      console.error("Failed to create workflow:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="z-10 flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-muted-foreground animate-pulse tracking-widest uppercase">
            {isLoading ? "Provisioning pipeline..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full space-y-6">
      {/* Inline Top Bar */}
      <div className="flex items-center gap-3 pb-3 border-b border-border/40">
        <button
          onClick={() => router.push("/dashboard/new")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back to Templates
        </button>
      </div>

      {/* Form Body Container */}
      <div className="w-full flex justify-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-2xl space-y-10"
        >
          {/* Page title */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {selectedTemplate ? "Configure Template" : "New Blank Workflow"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedTemplate
                ? `Starting from "${selectedTemplate.name}" — customise the details below.`
                : "Give your pipeline a name and choose an execution engine to get started."}
            </p>
          </div>

          {/* Template badge */}
          {selectedTemplate && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FiZap className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{selectedTemplate.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{selectedTemplate.category} · {selectedTemplate.nodes.length} nodes pre-wired</p>
              </div>
              <button
                onClick={() => { setSelectedTemplate(null); setName("My Blank Workflow"); setDescription(""); }}
                className="ml-auto text-[10px] text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-1 shrink-0 cursor-pointer transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* ── FORM FIELDS ── */}
          <div className="space-y-7">

            {/* Workflow Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-widest">
                Workflow Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Workflow"
                className="w-full h-11 px-4 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-zinc-700 font-sans"
              />
            </div>

            {/* Workflow Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-widest">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this pipeline..."
                rows={3}
                className="w-full p-4 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-zinc-700 font-sans resize-none"
              />
            </div>

            {/* Execution Engine Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground uppercase tracking-widest">
                Execution Engine
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ENGINES.map((eng) => {
                  const isSel = engine === eng.id;
                  return (
                    <div
                      key={eng.id}
                      onClick={() => setEngine(eng.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2 flex flex-col justify-between ${
                        isSel
                          ? "bg-foreground/5 border-foreground shadow-2xs"
                          : "bg-card border-border hover:border-border-hover"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{eng.label}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                            eng.badge === "Recommended"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                              : eng.badge === "Stable"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/25"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                          }`}>
                            {eng.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">{eng.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
            <button
              onClick={() => router.push("/dashboard/new")}
              className="flex items-center gap-1.5 h-11 px-6 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleLaunch}
              disabled={!name.trim()}
              className="flex items-center gap-2 h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground text-sm font-bold transition-all cursor-pointer"
            >
              <FiPlay className="h-4 w-4" />
              Launch Canvas
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense>
      <ConfigurePageInner />
    </Suspense>
  );
}
