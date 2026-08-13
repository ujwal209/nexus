"use client";

import React, { useState } from "react";
import { FiArrowRight, FiActivity, FiChevronRight, FiLayers } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface TemplateItem {
  id: string;
  title: string;
  category: "Research" | "Support" | "Security" | "Code";
  description: string;
  nodeCount: number;
  avgLatency: string;
  nodesUsed: string[];
}

export const TemplateShowcase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-1");

  const templates: TemplateItem[] = [
    {
      id: "tpl-1",
      title: "Autonomous Web Researcher",
      category: "Research",
      description: "Queries Tavily search, parses multi-page results, retrieves Pinecone RAG context, and streams executive summaries using DeepSeek R1.",
      nodeCount: 5,
      avgLatency: "1.4s",
      nodesUsed: ["Webhook Trigger", "Tavily Search", "Pinecone Vector", "DeepSeek R1", "JSON Stream"],
    },
    {
      id: "tpl-2",
      title: "Customer Support Intent Router",
      category: "Support",
      description: "Classifies ticket intent via GPT-4o, checks SQL customer database, and routes urgent cases to human Slack webhooks.",
      nodeCount: 5,
      avgLatency: "850ms",
      nodesUsed: ["Webhook Trigger", "GPT-4o Classifier", "Postgres DB", "If/Else Router", "Slack Webhook"],
    },
    {
      id: "tpl-3",
      title: "Code Security & Audit Supervisor",
      category: "Security",
      description: "Scans GitHub PR diffs, executes static analysis tools inside Python sandbox VM, and posts review comments via DeepSeek R1.",
      nodeCount: 5,
      avgLatency: "2.1s",
      nodesUsed: ["GitHub Webhook", "Diff Parser", "Python Sandbox", "DeepSeek R1", "GitHub API"],
    },
    {
      id: "tpl-4",
      title: "SQL Data Analyst Agent",
      category: "Code",
      description: "Converts natural language questions into optimized SQL queries, validates schema integrity, and formats chart outputs.",
      nodeCount: 4,
      avgLatency: "1.1s",
      nodesUsed: ["Webhook Trigger", "Schema Retriever", "GPT-4o SQL", "Chart Renderer"],
    },
  ];

  const categories = ["All", "Research", "Support", "Security", "Code"];

  const filteredTemplates = templates.filter(
    (t) => activeCategory === "All" || t.category === activeCategory
  );

  // Fallback to first available if selected template isn't in active category filter
  const activeTemplate = filteredTemplates.find(t => t.id === selectedTemplateId) || filteredTemplates[0];

  return (
    <section id="templates" className="py-24 bg-muted/30 relative border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
        >
          <div className="space-y-4 max-w-2xl">
            <Badge variant="outline" className="text-xs font-mono font-semibold text-primary uppercase tracking-widest px-3.5 py-1.5 bg-primary/10 border-primary/20 rounded-full">
              PRE-BUILT BLUEPRINTS
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight font-sans">
              Start with Ready Templates
            </h2>
            <p className="text-base text-muted-foreground font-medium font-sans">
              Deploy pre-configured agent flows instantly. Customize and extend components inside the builder canvas.
            </p>
          </div>

          {/* CATEGORY TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-card p-1.5 rounded-xl border border-border shadow-sm shrink-0">
            {categories.map((cat) => (
              <motion.div key={cat} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  variant={activeCategory === cat ? "default" : "ghost"}
                  onClick={() => {
                    setActiveCategory(cat);
                    // Reset to first item of newly selected category
                    const newFiltered = templates.filter(t => cat === "All" || t.category === cat);
                    if (newFiltered.length > 0) {
                      setSelectedTemplateId(newFiltered[0].id);
                    }
                  }}
                  className={`text-xs font-semibold cursor-pointer rounded-lg px-4 py-2 h-auto min-h-[36px] transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* INTERACTIVE SPLIT EXPLORER LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT SIDEBAR: SELECTOR LIST */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((tpl) => (
                <motion.div
                  key={tpl.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      activeTemplate?.id === tpl.id
                        ? "bg-card border-primary/50 shadow-xs ring-1 ring-primary/10"
                        : "bg-transparent border-border/80 hover:border-border hover:bg-card/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">{tpl.category}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{tpl.avgLatency}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground font-sans truncate">{tpl.title}</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RIGHT PREVIEW PANEL */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTemplate && (
                <motion.div
                  key={activeTemplate.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <Card className="border border-border bg-card p-8 flex flex-col justify-between h-full rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="space-y-6">
                      
                      {/* Top Meta info */}
                      <div className="flex items-center justify-between pb-4 border-b border-border/40">
                        <Badge variant="outline" className="text-xs font-mono font-semibold text-primary bg-primary/10 px-3 py-1 border-primary/20 rounded-md">
                          {activeTemplate.category}
                        </Badge>
                        <div className="flex items-center gap-3 text-xs font-mono font-semibold text-muted-foreground">
                          <span className="bg-muted px-2.5 py-1 rounded-md border border-border">{activeTemplate.nodeCount} Nodes</span>
                          <span className="text-accent bg-accent/10 border border-accent/20 rounded-md px-2.5 py-1">{activeTemplate.avgLatency}</span>
                        </div>
                      </div>

                      {/* Header copy */}
                      <div className="space-y-2">
                        <h3 className="text-2xl font-extrabold text-foreground font-sans tracking-tight">{activeTemplate.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-sans max-w-2xl">
                          {activeTemplate.description}
                        </p>
                      </div>

                      {/* VISUAL FLOW DIAGRAM - Node pills with favicons connected with chevrons */}
                      <div className="py-6 px-4 bg-muted/40 border border-border/60 rounded-xl dark:bg-card/10 select-none">
                        <div className="flex flex-wrap items-center gap-2">
                          {activeTemplate.nodesUsed.map((node, index) => {
                            let iconUrl = "";
                            const n = node.toLowerCase();
                            if (n.includes("search") || n.includes("tavily")) {
                              iconUrl = "https://avatars.githubusercontent.com/u/127116773?s=200&v=4";
                            } else if (n.includes("deepseek") || n.includes("r1")) {
                              iconUrl = "https://svgl.app/library/deepseek.svg";
                            } else if (n.includes("gpt") || n.includes("openai") || n.includes("classifier") || n.includes("sql")) {
                              iconUrl = "https://svgl.app/library/openai.svg";
                            } else if (n.includes("python")) {
                              iconUrl = "https://svgl.app/library/python.svg";
                            } else if (n.includes("postgres") || n.includes("sql") || n.includes("db")) {
                              iconUrl = "https://svgl.app/library/postgresql.svg";
                            } else if (n.includes("slack")) {
                              iconUrl = "https://svgl.app/library/slack.svg";
                            } else if (n.includes("github")) {
                              iconUrl = "https://svgl.app/library/github_light.svg";
                            } else if (n.includes("webhook") || n.includes("postman") || n.includes("trigger")) {
                              iconUrl = "https://svgl.app/library/postman.svg";
                            } else if (n.includes("gemini")) {
                              iconUrl = "https://svgl.app/library/gemini.svg";
                            } else if (n.includes("pinecone") || n.includes("vector")) {
                              iconUrl = "https://svgl.app/library/pinecone.svg";
                            }

                            return (
                              <React.Fragment key={index}>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-mono font-semibold text-foreground">
                                  {iconUrl && <img src={iconUrl} className="w-3.5 h-3.5 object-contain" alt="" />}
                                  <span>{node}</span>
                                </span>
                                {index < activeTemplate.nodesUsed.length - 1 && (
                                  <FiChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Bottom CTA Action */}
                    <div className="pt-6 border-t border-border flex items-center justify-between mt-8">
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-muted-foreground">
                        <FiActivity className="h-3.5 w-3.5 text-primary" />
                        <span>Ready to Run in Studio Canvas</span>
                      </div>
                      <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 py-5 h-auto rounded-xl shadow-lg shadow-primary/20 gap-2 cursor-pointer">
                        <Link href="/playground" className="flex items-center gap-1.5">
                          <FiLayers className="h-4 w-4" />
                          <span>Deploy Blueprint</span>
                          <FiArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};
