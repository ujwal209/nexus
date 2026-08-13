"use client";

import React from "react";
import Link from "next/link";
import { FiServer, FiArrowRight } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LLMNodeDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary bg-primary/10 border-primary/20">
            Node Reference
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          LLM Orchestrator Node
        </h1>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          The central reasoning engine. Configure model parameters, system prompts, dynamic tool schemas, and fallback providers.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">Supported Model Providers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-border bg-card rounded-xl text-center">
            <h3 className="font-bold text-sm">Anthropic</h3>
            <p className="text-xs text-muted-foreground mt-1">Claude 3.5 Sonnet, Haiku</p>
          </Card>
          <Card className="p-4 border border-border bg-card rounded-xl text-center">
            <h3 className="font-bold text-sm">OpenAI</h3>
            <p className="text-xs text-muted-foreground mt-1">GPT-4o, GPT-4o-mini</p>
          </Card>
          <Card className="p-4 border border-border bg-card rounded-xl text-center">
            <h3 className="font-bold text-sm">Ollama / Local</h3>
            <p className="text-xs text-muted-foreground mt-1">Llama 3, DeepSeek R1</p>
          </Card>
        </div>

        <h2 className="text-xl font-bold text-foreground">Node Parameters</h2>
        <pre className="bg-muted/80 p-5 rounded-xl border border-border text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
{`{
  "node_type": "llm_orchestrator",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "temperature": 0.2,
  "max_tokens": 4096,
  "stream": true,
  "system_prompt": "You are an autonomous senior code auditor..."
}`}
        </pre>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next: Vector Database Node</span>
        <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1">
          <Link href="/docs/nodes/vector">
            <span>Vector DBs</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
