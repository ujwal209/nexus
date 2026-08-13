"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-light opacity-50 pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto space-y-6"
            >
              <Badge variant="outline" className="text-xs font-mono font-semibold text-primary uppercase tracking-widest px-3.5 py-1.5 bg-primary/10 border-primary/20 rounded-full">
                OUR MISSION
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-sans leading-[1.1]">
                Democratizing <span className="text-primary">Autonomous</span> Systems
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
                We believe that building production-grade multi-agent systems shouldn't require months of infrastructure engineering. NEXUS AI was built to give every developer superpowers.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 bg-muted/30 border-t border-border">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-slate dark:prose-invert max-w-none font-sans"
            >
              <h2 className="text-3xl font-bold mb-6">The Infrastructure Bottleneck</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                When large language models advanced, the promise was autonomous software that could reason, search the web, and execute tools. But building this reality meant wrestling with flaky Python scripts, managing complex vector database retrievals, and debugging infinite agent loops.
              </p>
              
              <h2 className="text-3xl font-bold mb-6">Enter NEXUS AI</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                NEXUS AI provides a visual, reactive pipeline engine that compiles your drag-and-drop workflow directly into high-performance, sub-10ms serverless edge functions. Whether you're building a simple RAG chatbot or a complex multi-agent security auditor, NEXUS handles the state, memory, and tool execution transparently.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold mb-3">Open Architecture</h3>
                  <p className="text-sm text-muted-foreground">
                    We don't lock you into a specific model provider. Bring your own API keys for Anthropic, OpenAI, or run local Llama models.
                  </p>
                </div>
                <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
                  <p className="text-sm text-muted-foreground">
                    SOC2 Type II compliant by default. VPC deployment options ensure your data never leaves your infrastructure.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
