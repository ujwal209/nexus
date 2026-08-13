"use client";

import React from "react";
import Link from "next/link";
import { FiCode, FiArrowRight } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PythonSdkDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary bg-primary/10 border-primary/20">
            SDK Reference
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          Python SDK Guide
        </h1>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          Official Python client for triggering graphs, streaming logs, and inspecting vector states.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Installation</h2>
        <pre className="bg-muted/80 p-4 rounded-xl border border-border text-xs font-mono text-foreground">
          pip install nexus-ai-sdk
        </pre>

        <h2 className="text-xl font-bold text-foreground pt-4">Usage</h2>
        <pre className="bg-muted/80 p-5 rounded-xl border border-border text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
{`from nexus import NexusClient

client = NexusClient(api_key="nx_live_secret_...")
response = client.graphs.run("my_agent_id", inputs={"query": "hello"})
print(response)`}
        </pre>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next: TypeScript SDK</span>
        <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1">
          <Link href="/docs/api/typescript">
            <span>TypeScript SDK</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
