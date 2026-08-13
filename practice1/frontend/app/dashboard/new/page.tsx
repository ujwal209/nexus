"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiPlus, FiSearch, FiArrowRight, FiGrid } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  techStack: string[];
}

const BUSINESS_USECASES: Template[] = [
  {
    id: "ai-support-copilot",
    name: "AI Customer Support Co-pilot",
    description: "Intercept incoming support webhooks, classify sentiment severity using Anthropic Claude, and route critical alerts to Slack escalation channels.",
    category: "Support & CRM",
    techStack: ["Claude 3.5", "Slack Webhook", "Zendesk API"]
  },
  {
    id: "lead-enrichment-pipeline",
    name: "Automated Lead Enrichment Pipeline",
    description: "Scan new signups in database, execute Tavily research to crawl domain contacts, and append data directly to HubSpot contact fields.",
    category: "Sales & Marketing",
    techStack: ["Tavily Search", "HubSpot API", "GPT-4o"]
  },
  {
    id: "stripe-churn-recovery",
    name: "SaaS Billing Churn Recovery",
    description: "Listen to Stripe invoice payment failure hooks, match against Mongo logs, run custom JS VM recovery discount calculations, and send SMTP emails.",
    category: "Billing & Finance",
    techStack: ["NodeJS VM", "Stripe API", "SMTP Email"]
  },
  {
    id: "ecommerce-inventory-swarm",
    name: "E-commerce Inventory Sync Swarm",
    description: "Monitor Shopify warehouse database inventory schedules, reconcile count discrepancies via Python sandbox pandas scripts, and alert Discord channels.",
    category: "Operations",
    techStack: ["Python VM", "PostgreSQL", "Discord API"]
  },
  {
    id: "github-pr-reviewer",
    name: "Autonomous PR Code Reviewer",
    description: "Capture GitHub Pull Request webhooks, parse pull requests code diffs, send content to Claude 3.7, and write triage review comments.",
    category: "Developer Tools",
    techStack: ["Claude 3.7", "GitHub API", "NodeJS VM"]
  },
  {
    id: "outreach-email-swarm",
    name: "Sales Outreach Email Swarm",
    description: "Query CRM contact databases, generate personalized outreach drafts with Claude based on industry metrics, and send drafts directly to outbound mailboxes.",
    category: "Sales & Marketing",
    techStack: ["Claude 3.5", "SMTP Email", "HubSpot API"]
  }
];

export default function TemplatesPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const savedToken = localStorage.getItem("nexus-token");
    if (!savedToken) {
      router.push("/login");
      return;
    }
    setToken(savedToken);
    setAuthLoading(false);
  }, [router]);

  const handleSelectTemplate = (tmpl: Template) => {
    router.push(`/dashboard/new/configure?template=${tmpl.id}`);
  };

  const handleSelectBlank = () => {
    router.push("/dashboard/new/configure");
  };

  const categories = ["All", "Support & CRM", "Sales & Marketing", "Billing & Finance", "Operations", "Developer Tools"];

  const filteredUseCases = BUSINESS_USECASES.filter((tmpl) => {
    const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || tmpl.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground mt-3">Verifying session...</p>
      </div>
    );
  }

  return (
    <motion.div
      key="templates"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Inline subheader controls */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="h-9 rounded-lg border border-border px-3.5 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h2 className="text-sm font-bold text-foreground">Select Agent Template</h2>
            <p className="text-xs text-muted-foreground">Select an integration blueprint below to instantiate a visual node pipeline sandbox.</p>
          </div>
        </div>
        <Button
          onClick={handleSelectBlank}
          className="bg-foreground text-background hover:bg-foreground/90 font-extrabold text-xs px-4 h-9 rounded-lg cursor-pointer shadow-sm flex items-center gap-1.5"
        >
          <FiPlus className="h-4 w-4" />
          <span>Blank Canvas</span>
        </Button>
      </div>

      {/* Filtering and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blueprints by keyword, integration type, or target model..."
            className="pl-9 h-10 text-xs bg-card border-border rounded-lg text-foreground focus-visible:ring-foreground focus-visible:ring-offset-0 focus-visible:border-zinc-700"
          />
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full sm:max-w-md">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
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

      {/* Table Layout */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        {/* Headers row */}
        <div className="p-4 border-b border-border bg-muted/20 text-[10px] uppercase font-mono font-bold text-muted-foreground tracking-wider grid grid-cols-12 gap-4 items-center">
          <span className="col-span-5 sm:col-span-4">Blueprint Name</span>
          <span className="col-span-7 sm:col-span-5">Business Use Case</span>
          <span className="col-span-2 text-center hidden sm:block">Tech Stack</span>
          <span className="col-span-1 text-right">Actions</span>
        </div>

        {/* List Body */}
        <div className="divide-y divide-border text-xs">
          {filteredUseCases.length > 0 ? (
            filteredUseCases.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl)}
                className="p-5 grid grid-cols-12 gap-4 items-center hover:bg-muted/10 transition-colors cursor-pointer group"
              >
                {/* Name */}
                <div className="col-span-5 sm:col-span-4 space-y-1.5 min-w-0 pr-2">
                  <span className="font-extrabold text-xs text-foreground block truncate group-hover:text-primary transition-colors leading-tight">
                    {tmpl.name}
                  </span>
                  <Badge variant="outline" className="text-[8px] font-mono uppercase bg-muted/40 text-muted-foreground border-border px-1.5 py-0.5">
                    {tmpl.category}
                  </Badge>
                </div>

                {/* Description */}
                <div className="col-span-6 sm:col-span-5 text-[11px] text-muted-foreground leading-relaxed font-normal pr-2">
                  {tmpl.description}
                </div>

                {/* Tech Stack Badge Lists */}
                <div className="col-span-2 flex-wrap gap-1 justify-center hidden sm:flex">
                  {tmpl.techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="outline"
                      className="text-[9px] font-mono text-muted-foreground bg-muted/20 border-border px-1.5 py-0.5"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="col-span-1 text-right shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(tmpl);
                    }}
                    className="h-8 w-8 bg-muted hover:bg-foreground hover:text-background text-foreground border border-border rounded-lg cursor-pointer flex items-center justify-center ml-auto transition-colors"
                    title="Spin up template"
                  >
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="p-12 text-center text-muted-foreground font-medium">
              No matching blueprints found.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
