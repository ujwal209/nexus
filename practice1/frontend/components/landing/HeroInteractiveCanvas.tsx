"use client";

import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const HeroInteractiveCanvas: React.FC = () => {
  return (
    <div className="w-full relative py-16 md:py-28 overflow-hidden bg-background">
      {/* Premium ambient backdrop glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0 opacity-35 dark:opacity-20 select-none">
        <div 
          className="absolute top-[-10%] left-[30%] w-[50%] h-[70%] rounded-full blur-[130px]" 
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: HERO COPY */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start max-w-xl mx-auto lg:mx-0"
          >
            <h1 className="text-4xl sm:text-6xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-sans leading-[1.08]">
              Orchestrate <br className="hidden sm:inline" />
              Autonomous <br />
              <span className="bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                Agent Pipelines
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed font-sans">
              NEXUS is the visual sandbox engine built to execute, deploy, and scale multi-agent systems. Connect LLMs, vector stores, API webhook tools, and sandboxed runtimes with absolute ease.
            </p>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-8 py-5 rounded-xl shadow-lg shadow-primary/20 gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Link href="/playground" className="flex items-center justify-center gap-1.5">
                    <span>Launch Studio Builder</span>
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto border-border bg-card text-foreground hover:bg-muted font-bold text-sm px-8 py-5 rounded-xl gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Link href="/docs">View Documentation</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: FLOATING CANVAS NODE GRAPH */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="hidden lg:block lg:col-span-6 relative w-full h-[400px] sm:h-[420px] overflow-x-auto lg:overflow-visible no-scrollbar"
          >
            {/* Scrollable grid inner wrapper for mobile responsive viewports */}
            <div className="min-w-[600px] lg:min-w-0 h-full relative">
              {/* Custom glowing background spotlights - Single Primary Red Theme */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
                <div className="absolute top-[-10%] left-[20%] w-[50%] h-[70%] rounded-full opacity-15 blur-[80px]" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
              </div>

              {/* SVG Connector Paths - Unified Connection Theme */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* Default Paths */}
                <path d="M 190 185 C 210 185, 200 60, 220 60" fill="none" stroke="var(--border)" strokeWidth="2" strokeOpacity="0.7" />
                <path d="M 190 185 C 210 185, 200 310, 220 310" fill="none" stroke="var(--border)" strokeWidth="2" strokeOpacity="0.7" />
                <path d="M 390 60 C 410 60, 400 120, 420 120" fill="none" stroke="var(--border)" strokeWidth="2" strokeOpacity="0.7" />
                <path d="M 390 185 C 410 185, 400 120, 420 120" fill="none" stroke="var(--border)" strokeWidth="2" strokeOpacity="0.7" />
                <path d="M 390 310 C 410 310, 400 250, 420 250" fill="none" stroke="var(--border)" strokeWidth="2" strokeOpacity="0.7" />
                <path d="M 390 120 C 410 120, 400 250, 420 250" fill="none" stroke="var(--border)" strokeWidth="2" strokeOpacity="0.7" />

                {/* Active Flow Path */}
                <path 
                  d="M 190 185 L 220 185" 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="2" 
                  strokeOpacity="0.9"
                  className="animate-flow-line" 
                />
              </svg>

              {/* NODE 1: Webhook Trigger (Left) */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="absolute left-[20px] top-[155px] z-10 w-[170px] bg-card/85 border border-border/80 rounded-2xl p-4 shadow-md dark:shadow-2xl backdrop-blur-md transition-all hover:border-primary/45 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-border/40">
                  <img src="https://svgl.app/library/postman.svg" className="w-5 h-5 object-contain" />
                  <span className="font-bold text-[11px] text-foreground truncate">Webhook Trigger</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">POST</span>
                  <span className="text-[9px] font-mono text-muted-foreground">trigger-1</span>
                </div>
              </motion.div>

              {/* NODE 2: Tavily Search (Center Top) */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="absolute left-[220px] top-[30px] z-10 w-[170px] bg-card/85 border border-border/80 rounded-2xl p-4 shadow-md dark:shadow-2xl backdrop-blur-md transition-all hover:border-border cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-border/40">
                  <img src="https://avatars.githubusercontent.com/u/127116773?s=200&v=4" className="w-5 h-5 object-contain" />
                  <span className="font-bold text-[11px] text-foreground truncate">Tavily Search</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">WEB API</span>
                  <span className="text-[9px] font-mono text-muted-foreground">tool-1</span>
                </div>
              </motion.div>

              {/* NODE 3: Python Sandbox (Center Middle) */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="absolute left-[220px] top-[155px] z-10 w-[170px] bg-card/85 border border-border/80 rounded-2xl p-4 shadow-md dark:shadow-2xl backdrop-blur-md transition-all hover:border-border cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-border/40">
                  <img src="https://svgl.app/library/python.svg" className="w-5 h-5 object-contain" />
                  <span className="font-bold text-[11px] text-foreground truncate">Python Sandbox</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">gVisor VM</span>
                  <span className="text-[9px] font-mono text-muted-foreground">tool-2</span>
                </div>
              </motion.div>

              {/* NODE 4: Docker Executor (Center Bottom) */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="absolute left-[220px] top-[280px] z-10 w-[170px] bg-card/85 border border-border/80 rounded-2xl p-4 shadow-md dark:shadow-2xl backdrop-blur-md transition-all hover:border-border cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-border/40">
                  <img src="https://svgl.app/library/docker.svg" className="w-5 h-5 object-contain" />
                  <span className="font-bold text-[11px] text-foreground truncate">Docker Executor</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">RUNTIME</span>
                  <span className="text-[9px] font-mono text-muted-foreground">tool-3</span>
                </div>
              </motion.div>

              {/* NODE 5: DeepSeek R1 (Right Top) */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="absolute left-[420px] top-[90px] z-10 w-[170px] bg-card/85 border border-primary/50 ring-2 ring-primary/10 rounded-2xl p-4 shadow-lg dark:shadow-2xl backdrop-blur-md transition-all hover:border-primary cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-border/40">
                  <img src="https://svgl.app/library/deepseek.svg" className="w-5 h-5 object-contain" />
                  <span className="font-bold text-[11px] text-foreground truncate font-sans">DeepSeek R1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">REASONING</span>
                  <span className="text-[9px] font-mono text-muted-foreground">llm-1</span>
                </div>
              </motion.div>

              {/* NODE 6: Slack Alert Bot (Right Bottom) */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="absolute left-[420px] top-[220px] z-10 w-[170px] bg-card/85 border border-border/80 rounded-2xl p-4 shadow-md dark:shadow-2xl backdrop-blur-md transition-all hover:border-border cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-border/40">
                  <img src="https://svgl.app/library/slack.svg" className="w-5 h-5 object-contain" />
                  <span className="font-bold text-[11px] text-foreground truncate font-sans">Slack Alert Bot</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">INTEGRATION</span>
                  <span className="text-[9px] font-mono text-muted-foreground">app-1</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
