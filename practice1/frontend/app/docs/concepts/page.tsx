"use client";

import React from "react";
import Link from "next/link";
import { FiLayers, FiArrowRight } from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ConceptsDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary bg-primary/10 border-primary/20">
            Architecture
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          Core Concepts
        </h1>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          Understand the foundational building blocks of the NEXUS AI pipeline engine: Nodes, Edges, State, and Routing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
          <CardHeader className="p-0 space-y-2">
            <Badge className="w-fit bg-primary/10 text-primary border-primary/20 text-xs font-mono">1. Nodes</Badge>
            <CardTitle className="text-xl">Execution Units</CardTitle>
            <CardDescription className="text-sm">
              Nodes represent discrete operations (LLM calls, vector lookups, API requests, code runners). Each node takes inputs and produces structured outputs.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
          <CardHeader className="p-0 space-y-2">
            <Badge className="w-fit bg-accent/10 text-accent border-accent/20 text-xs font-mono">2. Edges</Badge>
            <CardTitle className="text-xl">Data Streams</CardTitle>
            <CardDescription className="text-sm">
              Edges connect nodes together, passing JSON payloads and streaming token buffers across the pipeline in sub-10ms latency.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
          <CardHeader className="p-0 space-y-2">
            <Badge className="w-fit bg-secondary text-secondary-foreground border-secondary-foreground/20 text-xs font-mono">3. State Memory</Badge>
            <CardTitle className="text-xl">Shared State</CardTitle>
            <CardDescription className="text-sm">
              The execution state is persisted in an in-memory buffer across long-running multi-step conversations.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
          <CardHeader className="p-0 space-y-2">
            <Badge className="w-fit bg-primary/10 text-primary border-primary/20 text-xs font-mono">4. Supervisors</Badge>
            <CardTitle className="text-xl">Hierarchical Routing</CardTitle>
            <CardDescription className="text-sm">
              Supervisor nodes evaluate task intent and delegate work to specialized sub-agent subgraphs autonomously.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next Topic: LLM Orchestrator</span>
        <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1">
          <Link href="/docs/nodes/llm">
            <span>LLM Orchestrator</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
