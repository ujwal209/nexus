"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const IntegrationLogos = {
  gmail: (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 5H3V19H21V5Z" fill="#EAEAEA" />
      <path d="M21 5L12 13L3 5H21Z" fill="#EA4335" />
      <path d="M21 5V19H17V10L21 5Z" fill="#FBBC04" />
      <path d="M3 5V19H7V10L3 5Z" fill="#4285F4" />
      <path d="M12 13L17 10V19H7V10L12 13Z" fill="#34A853" />
    </svg>
  ),
  slack: (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52h-2.52z" fill="#36C5F0"/>
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521z" fill="#2EB67D"/>
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.165 18.958a2.528 2.528 0 0 1 2.52 2.521 2.528 2.528 0 0 1-2.52 2.521 2.527 2.527 0 0 1-2.523-2.521v-2.521h2.523z" fill="#ECB22E"/>
      <path d="M15.165 17.687a2.527 2.527 0 0 1-2.52-2.522 2.528 2.528 0 0 1 2.52-2.521h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z" fill="#ECB22E"/>
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="w-10 h-10 text-foreground" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  tavily: (
    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black font-sans text-xl tracking-tighter">
      Tv
    </div>
  ),
  stripe: (
    <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center text-white font-bold font-sans text-lg">
      S
    </div>
  ),
  openai: (
    <svg viewBox="0 0 24 24" className="w-10 h-10 text-foreground" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.28 11.23A8.44 8.44 0 0021.56 6a8.4 8.4 0 00-7.39-4.25c-1.57 0-3.11.45-4.42 1.29A8.45 8.45 0 004.5 4.3 8.4 8.4 0 002.44 9a8.45 8.45 0 00.7 5.25A8.4 8.4 0 006.18 19.3c1.54 0 3.06-.44 4.36-1.27a8.45 8.45 0 005.15 1.27A8.4 8.4 0 0021.56 18a8.45 8.45 0 001.37-4.14c.1-.88-.13-1.78-.65-2.63zm-9.35 6.94a6.38 6.38 0 01-3.66-1.15c.14-.02.42-.08.6-.18l4.47-2.58a1 1 0 00.5-.87v-5.2a4.4 4.4 0 001.07.62v4.88a6.38 6.38 0 01-2.98 4.48zM5.55 15.6A6.38 6.38 0 014.2 12.3c0-.14.07-.4.18-.55l4.47-2.58a1 1 0 00.5-.3v-5.2a4.4 4.4 0 00-.54.91L6.59 9.6a6.38 6.38 0 01-1.04 5.34V15.6zm.57-7.25a6.38 6.38 0 012.3-3.66c-.1.1-.3.26-.45.4l-4.47 2.58a1 1 0 00-.5.87v5.2a4.4 4.4 0 00.54-.92L6.12 8.35zM17.88 8.4a6.38 6.38 0 01-1.35 3.3c0 .14-.07.4-.18.55l-4.47 2.58a1 1 0 00-.5.3v5.2a4.4 4.4 0 00.54-.91l2.22-5.02a6.38 6.38 0 013.74-5.9zM18.45 15.6a6.38 6.38 0 01-2.3 3.66c.1-.1.3-.26.45-.4l4.47-2.58a1 1 0 00.5-.87v-5.2a4.4 4.4 0 00-.54.92l-2.58 4.47zM11.07 5.83a6.38 6.38 0 013.66 1.15c-.14.02-.42.08-.6.18L9.66 9.74a1 1 0 00-.5.87v5.2a4.4 4.4 0 00-1.07-.62V10.3a6.38 6.38 0 012.98-4.47zM12 13.88a2.12 2.12 0 110-4.24 2.12 2.12 0 010 4.24z"/>
    </svg>
  )
};

export default function FeaturesPage() {
  const integrations = [
    { name: "Gmail", logo: IntegrationLogos.gmail, desc: "Trigger workflows from emails or send automated replies." },
    { name: "Slack", logo: IntegrationLogos.slack, desc: "Send notifications, ask for human-in-the-loop approvals." },
    { name: "GitHub", logo: IntegrationLogos.github, desc: "Run PR reviews, issue triaging, and code analysis." },
    { name: "Tavily Search", logo: IntegrationLogos.tavily, desc: "Live web scraping and research tailored for AI." },
    { name: "Stripe", logo: IntegrationLogos.stripe, desc: "Process payments or query customer billing history." },
    { name: "OpenAI", logo: IntegrationLogos.openai, desc: "Native GPT-4o integration for reasoning nodes." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      <LandingNavbar />

      <main className="flex-1 pb-24">
        {/* Header Section */}
        <section className="py-20 md:py-28 overflow-hidden relative border-b border-border">
          <div className="absolute inset-0 bg-muted/20 pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <Badge variant="outline" className="text-xs font-mono font-semibold text-primary uppercase tracking-widest px-3.5 py-1.5 bg-primary/10 border-primary/20 rounded-full">
                INTEGRATIONS
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-sans leading-[1.1]">
                Connect to <span className="text-primary">Everything</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
                NEXUS AI seamlessly connects to your existing software stack. Build agents that act on real data.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Integration Grid */}
        <section className="py-24 bg-background">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {integrations.map((int, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-8 h-full flex flex-col items-start border border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                    <div className="mb-6 bg-muted/40 p-4 rounded-2xl border border-border/50">
                      {int.logo}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{int.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {int.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
