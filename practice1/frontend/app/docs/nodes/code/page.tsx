"use client";

import React from "react";
import Link from "next/link";
import { FiCode, FiArrowRight } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CodeNodeDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary bg-primary/10 border-primary/20">
            Execution Sandbox
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          Code Sandbox Node
        </h1>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          Execute isolated Python and JavaScript scripts securely within gVisor micro-sandboxes.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Python Example</h2>
        <pre className="bg-muted/80 p-5 rounded-xl border border-border text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
{`def main(inputs):
    data = inputs.get("search_results")
    filtered = [item for item in data if item["score"] > 0.8]
    return {"top_results": filtered}`}
        </pre>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next: REST API Reference</span>
        <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1">
          <Link href="/docs/api/rest">
            <span>REST API</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
