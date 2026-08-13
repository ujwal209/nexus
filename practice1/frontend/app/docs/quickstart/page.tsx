"use client";

import React from "react";
import Link from "next/link";
import { FiZap, FiArrowRight, FiCheckCircle, FiCode, FiTerminal } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function QuickstartDocsPage() {
  return (
    <div className="space-y-10 max-w-full sm:max-w-3xl font-sans min-w-0">
      
      {/* Title Header */}
      <div className="space-y-3 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary bg-primary/10 border-primary/20">
            5-Minute Tutorial
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">Estimated Time: 5 mins</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          Quickstart Guide
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
          Learn how to construct, test, and deploy a production autonomous web researcher agent from scratch using the NEXUS visual node builder.
        </p>
      </div>

      {/* Prerequisites Alert */}
      <Alert className="bg-muted/50 border-border text-foreground rounded-xl">
        <FiTerminal className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0">
          <AlertTitle className="font-bold text-sm">Prerequisites</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
            You will need a NEXUS AI account, an OpenAI or Anthropic API secret, and Node.js v18+ installed on your machine.
          </AlertDescription>
        </div>
      </Alert>

      {/* Detailed Steps */}
      <div className="space-y-8 min-w-0">
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-sm shrink-0">
              1
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Create a New Visual Canvas</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed sm:pl-11">
            Navigate to the NEXUS AI dashboard and click <strong>New Agent Graph</strong>. Set the workspace name to <code>research_assistant_v1</code> and select <em>Standard Stream Pipeline</em>.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-sm shrink-0">
              2
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Configure Trigger & Web Search Nodes</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed sm:pl-11">
            Drag a <strong>User Prompt Input</strong> node onto the canvas. Next, drag a <strong>Tavily Web Search</strong> node from the tool palette. Connect the output handle of the User Prompt node directly into the search input handle.
          </p>
          
          <div className="sm:pl-11 min-w-0">
            <div className="border border-border rounded-xl overflow-x-auto bg-card">
              <Table className="min-w-[360px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs">Node Field</TableHead>
                    <TableHead className="font-bold text-xs">Recommended Setting</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  <TableRow>
                    <TableCell className="font-bold">Max Results</TableCell>
                    <TableCell className="font-mono">5 web pages</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Search Depth</TableCell>
                    <TableCell className="font-mono">Advanced (Includes page body)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-sm shrink-0">
              3
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Attach LLM Orchestrator & Test</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed sm:pl-11">
            Connect the Tavily Search results to a <strong>Claude 3.5 Sonnet</strong> LLM Node. Provide the system prompt:
          </p>
          
          <div className="sm:pl-11 min-w-0">
            <div className="w-full overflow-x-auto rounded-2xl border border-border bg-muted/80 p-4 sm:p-5">
              <pre className="text-[11px] sm:text-xs font-mono text-foreground leading-relaxed whitespace-pre font-normal">
{`You are an executive research agent. Synthesize the provided search results into a concise summary with markdown bullet points.`}
              </pre>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next: Core Concepts</span>
        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5 px-4 py-2 shadow-sm">
          <Link href="/docs/concepts">
            <span>Core Concepts</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

    </div>
  );
}
