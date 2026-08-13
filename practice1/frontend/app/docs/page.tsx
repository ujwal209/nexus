"use client";

import React from "react";
import Link from "next/link";
import {
  FiZap,
  FiArrowRight,
  FiCode,
  FiTerminal,
  FiDatabase,
  FiCheckCircle,
  FiLayers,
  FiShield,
} from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CodeBlockWindow } from "@/components/docs/CodeBlockWindow";

export default function DocsPage() {
  return (
    <div className="space-y-12 max-w-full sm:max-w-3xl font-sans min-w-0">
      
      {/* 1. OVERVIEW & TITLE */}
      <section id="overview" className="space-y-4 border-b border-border/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-primary bg-primary/10 border-primary/20 rounded-md">
            v2.0 Documentation
          </Badge>
          <Badge variant="outline" className="text-xs font-mono text-accent bg-accent/10 border-accent/20 rounded-md">
            Production Ready
          </Badge>
          <span className="text-xs text-muted-foreground font-mono ml-auto">Last updated: Aug 2026</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight font-sans">
          NEXUS AI Documentation
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
          NEXUS AI is an enterprise visual node engine designed to model, execute, and scale autonomous multi-agent pipelines with sub-10ms latency.
        </p>

        {/* Alert Recommendation Banner */}
        <Alert className="bg-primary/5 border-primary/20 text-foreground rounded-xl mt-6">
          <FiZap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <AlertTitle className="font-bold text-sm">First time using NEXUS?</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
              We recommend following our step-by-step 5-minute visual graph tutorial to build your first autonomous web researcher agent.
            </AlertDescription>
          </div>
        </Alert>
      </section>

      {/* 2. ARCHITECTURE OVERVIEW */}
      <section id="quickstart" className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground font-sans">Architecture Overview</h2>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          NEXUS AI compiles visual graph workflows into lightweight, serverless edge functions. By isolating tool execution and LLM inference across asynchronous event loops, NEXUS eliminates state synchronization bottlenecks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border border-border/80 bg-card hover:shadow-md transition-shadow rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <FiLayers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Reactive State Engine</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In-memory Redis vector buffers automatically stream node output state to child sub-agents in real time.
            </p>
          </Card>

          <Card className="border border-border/80 bg-card hover:shadow-md transition-shadow rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                <FiShield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">gVisor Micro-Sandboxes</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Python and JavaScript code nodes execute inside zero-trust microVM sandboxes with strict CPU memory quotas.
            </p>
          </Card>
        </div>

        {/* PARAMETER TABLE USING SHADCN TABLE */}
        <div className="space-y-3 pt-4">
          <h3 className="text-base sm:text-lg font-bold text-foreground">Supported System Components</h3>
          <div className="border border-border rounded-xl overflow-x-auto bg-card shadow-xs">
            <Table className="min-w-[480px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-xs">Component</TableHead>
                  <TableHead className="font-bold text-xs">Supported Integrations</TableHead>
                  <TableHead className="font-bold text-xs">Default Quota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                <TableRow>
                  <TableCell className="font-bold">LLM Models</TableCell>
                  <TableCell>Claude 3.5 Sonnet, GPT-4o, DeepSeek R1, Llama 3</TableCell>
                  <TableCell className="font-mono">10,000 RPM</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Vector Stores</TableCell>
                  <TableCell>Pinecone, ChromaDB, Qdrant, Weaviate</TableCell>
                  <TableCell className="font-mono">Top-K 50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Web Tools</TableCell>
                  <TableCell>Tavily Search, GitHub API, Slack Webhooks, SQL</TableCell>
                  <TableCell className="font-mono">Sub-10ms</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* 3. HIGH-END SYNTAX HIGHLIGHTED CODE EXECUTION EXAMPLES */}
      <section id="examples" className="space-y-4 pt-6 border-t border-border/60 min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground font-sans">Execution Code Examples</h2>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
          Invoke your compiled visual agent graph programmatically via Python, TypeScript, or REST APIs:
        </p>

        <CodeBlockWindow />
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="space-y-4 pt-6 border-t border-border/60">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground font-sans">Frequently Asked Questions</h2>

        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="item-1" className="border border-border/80 rounded-2xl px-4 sm:px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline py-4 text-left">
              How does NEXUS AI handle state persistence across agent steps?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
              NEXUS uses an internal Redis & Vector buffer to store conversation history and memory embeddings automatically between node steps. State is maintained continuously for up to 30 days per thread.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border border-border/80 rounded-2xl px-4 sm:px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline py-4 text-left">
              Can I self-host the visual engine in my own AWS / GCP environment?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
              Yes! Our Enterprise tier provides Helm charts and Docker Compose bundles for VPC self-hosting with zero external network phone-home calls.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border border-border/80 rounded-2xl px-4 sm:px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline py-4 text-left">
              What is the execution timeout for long-running sub-agents?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
              Standard web requests time out after 60 seconds, but WebSocket/SSE stream pipelines support background execution tasks for up to 15 minutes.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Footer Nav Links */}
      <div className="pt-8 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next: Quickstart Guide</span>
        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5 px-4 py-2 shadow-sm">
          <Link href="/docs/quickstart">
            <span>Quickstart Guide</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

    </div>
  );
}
