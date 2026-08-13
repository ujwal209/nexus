"use client";

import React from "react";
import Link from "next/link";
import { FiTerminal, FiArrowRight } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RestApiDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary bg-primary/10 border-primary/20">
            API Reference
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          REST API Reference
        </h1>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          Interact with deployed agent graphs over HTTP using standard REST webhooks.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">Execute Graph Endpoint</h2>
        <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center gap-3 font-mono text-xs">
          <Badge className="bg-primary text-primary-foreground font-bold">POST</Badge>
          <span className="text-foreground font-bold">https://api.nexusai.com/v1/graphs/:graph_id/run</span>
        </div>

        <h3 className="text-base font-bold text-foreground">Headers</h3>
        <pre className="bg-muted/80 p-4 rounded-xl border border-border text-xs font-mono text-foreground">
{`Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json`}
        </pre>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next: Python SDK</span>
        <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1">
          <Link href="/docs/api/python">
            <span>Python SDK</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
