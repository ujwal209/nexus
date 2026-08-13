"use client";

import React from "react";
import Link from "next/link";
import { FiGlobe, FiArrowRight } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ToolsNodeDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary bg-primary/10 border-primary/20">
            Tool Integrations
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          Web Tools & Search Nodes
        </h1>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          Empower your agents to fetch live web data using Tavily, Serper, and custom HTTP webhooks.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 border border-border bg-card rounded-xl">
            <h3 className="font-bold text-sm mb-1">Live Web Search</h3>
            <p className="text-xs text-muted-foreground">Executes real-time Tavily search queries filtered for AI context.</p>
          </Card>
          <Card className="p-5 border border-border bg-card rounded-xl">
            <h3 className="font-bold text-sm mb-1">HTML Web Scraping</h3>
            <p className="text-xs text-muted-foreground">Extracts main article text while stripping advertising noise.</p>
          </Card>
        </div>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next: Code Sandboxes</span>
        <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1">
          <Link href="/docs/nodes/code">
            <span>Code Sandboxes</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
