"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiSave,
  FiCpu,
  FiCheckCircle,
} from "react-icons/fi";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

export default function ConfigureWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const graphId = params.id as string;

  const [token, setToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [rawWorkflow, setRawWorkflow] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [engine, setEngine] = useState("nexus_agent_v2");

  useEffect(() => {
    const savedToken = localStorage.getItem("nexus-token");
    if (!savedToken) { router.push("/login"); return; }
    setToken(savedToken);

    fetch(`${API_BASE_URL}/workflows/${graphId}`, {
      headers: { "Authorization": `Bearer ${savedToken}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setRawWorkflow(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setEngine(data.engine || "nexus_agent_v2");
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setAuthLoading(false));
  }, [router, graphId]);

  useEffect(() => {
    const saved = localStorage.getItem("nexus-theme");
    document.documentElement.classList.toggle("dark", (saved || "dark") === "dark");
  }, []);

  const handleSave = async () => {
    if (!rawWorkflow || !name.trim()) return;
    setIsSaving(true);

    const payload = {
      ...rawWorkflow,
      name: name.trim(),
      description: description.trim(),
      engine,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push(`/dashboard/workflow/${graphId}`), 600);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="z-10 flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-muted-foreground animate-pulse tracking-widest uppercase">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex font-sans overflow-hidden">
      <DashboardSidebar
        activeTab="workflows"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm px-8 flex items-center gap-4 shrink-0 sticky top-0 z-10">
          <button
            onClick={() => router.push(`/dashboard/workflow/${graphId}`)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Canvas
          </button>
          <span className="text-border">|</span>
          <span className="text-xs font-semibold text-foreground">Workflow Settings</span>
          {rawWorkflow?.name && (
            <>
              <span className="text-border">·</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{rawWorkflow.name}</span>
            </>
          )}
        </header>

        {/* Page body */}
        <div className="flex-1 flex flex-col items-center justify-start py-14 px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-2xl space-y-10"
          >
            {/* Page title */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Workflow Settings</h1>
              <p className="text-sm text-muted-foreground">
                Update the name, description, or execution engine for this pipeline.
              </p>
            </div>

            {/* ── FORM FIELDS ── */}
            <div className="space-y-7">

              {/* Workflow Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-widest">
                  Workflow Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. stripe_churn_recovery_v2"
                  className="w-full h-12 px-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-widest">
                  Description
                  <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Summarise what this pipeline does — triggers, LLMs, output destinations..."
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow resize-none"
                />
              </div>

              {/* Engine Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <FiCpu className="h-3.5 w-3.5" />
                  Execution Engine
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {ENGINES.map(eng => {
                    const active = engine === eng.id;
                    return (
                      <button
                        key={eng.id}
                        onClick={() => setEngine(eng.id)}
                        className={`w-full flex items-start gap-4 px-5 py-4 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          active ? "border-primary" : "border-muted-foreground/40"
                        }`}>
                          {active && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{eng.label}</span>
                            <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full ${
                              eng.badge === "Recommended" ? "bg-primary/15 text-primary" :
                              eng.badge === "Experimental" ? "bg-orange-500/15 text-orange-400" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {eng.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{eng.desc}</p>
                        </div>
                        {active && <FiCheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={() => router.push(`/dashboard/workflow/${graphId}`)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || saved}
                className="flex items-center gap-2 h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-sm font-bold transition-all cursor-pointer"
              >
                {saved ? (
                  <>
                    <FiCheckCircle className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
