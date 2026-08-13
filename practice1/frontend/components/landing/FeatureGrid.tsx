"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiArrowUpRight } from "react-icons/fi";

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-background relative border-t border-border">
      {/* Background glow spotlights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none z-0 opacity-10 blur-[100px]" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 75%)" }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 max-w-2xl mx-auto mb-16"
        >
          <Badge variant="outline" className="text-xs font-mono font-semibold text-primary uppercase tracking-widest px-3.5 py-1.5 bg-primary/10 border-primary/20 rounded-full">
            CORE PLATFORM CAPABILITIES
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight font-sans">
            Engineered for Production AI
          </h2>
          <p className="text-base text-muted-foreground font-medium font-sans">
            Everything you need to design, evaluate, debug, and scale autonomous multi-agent graph architectures.
          </p>
        </motion.div>

        {/* ULTRA-MODERN BENTO FEATURE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: Visual Graph Studio (Large Bento Card - col-span-2) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="md:col-span-2"
          >
            <Card className="group border border-border bg-card p-6 h-full flex flex-col justify-between overflow-hidden relative rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <Badge variant="secondary" className="text-[9px] font-mono tracking-wider uppercase bg-primary/5 text-primary border border-primary/15 rounded-md px-2 py-0.5">
                    Canvas Studio
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground font-sans flex items-center justify-between">
                    <span>Visual Workflow Designer</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    Drag-and-drop workflow designer canvas. Connect triggers, variables, custom runtimes, and LLM reasoning steps with absolute ease.
                  </p>
                </div>
                
                {/* Visual Mockup Right Column */}
                <div className="lg:col-span-7 relative w-full h-[180px] bg-muted/30 border border-border/40 rounded-xl overflow-hidden p-3 dark:bg-card/10 select-none">
                  {/* Floating Graph Illustration */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <path d="M 50 90 L 105 90" fill="none" stroke="var(--border)" strokeWidth="1.5" />
                    <path d="M 175 90 L 230 90" fill="none" stroke="var(--border)" strokeWidth="1.5" />
                  </svg>
                  
                  <div className="absolute left-[15px] top-[60px] bg-card border border-border/60 rounded-xl p-2 shadow-xs w-[90px] flex items-center gap-1.5">
                    <img src="https://svgl.app/library/postman.svg" className="w-3.5 h-3.5 object-contain" />
                    <span className="font-semibold text-[8px] truncate">Webhook</span>
                  </div>

                  <div className="absolute left-[120px] top-[60px] bg-card border border-primary/50 ring-2 ring-primary/10 rounded-xl p-2 shadow-sm w-[110px] flex items-center gap-1.5">
                    <img src="https://svgl.app/library/deepseek.svg" className="w-3.5 h-3.5 object-contain" />
                    <span className="font-semibold text-[8px] truncate">DeepSeek R1</span>
                  </div>

                  <div className="absolute left-[245px] top-[60px] bg-card border border-border/60 rounded-xl p-2 shadow-xs w-[90px] flex items-center gap-1.5">
                    <img src="https://svgl.app/library/slack.svg" className="w-3.5 h-3.5 object-contain" />
                    <span className="font-semibold text-[8px] truncate">Slack Bot</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CARD 2: Secure Python Sandbox (Small Bento Card - col-span-1) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="md:col-span-1"
          >
            <Card className="group border border-border bg-card p-6 h-full flex flex-col justify-between overflow-hidden relative rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="space-y-4">
                <div className="p-3 border border-border/60 rounded-xl bg-muted/30 font-mono text-[9px] text-muted-foreground leading-normal dark:bg-card/10 select-none overflow-x-auto">
                  <span className="text-[#e11d48]">async def</span> <span className="text-foreground">handle</span>(ctx):<br />
                  &nbsp;&nbsp;url = ctx.input[<span className="text-emerald-500">"url"</span>]<br />
                  &nbsp;&nbsp;res = <span className="text-[#3b82f6]">await</span> httpx.get(url)<br />
                  &nbsp;&nbsp;<span className="text-[#3b82f6]">return</span> res.json()
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <img src="https://svgl.app/library/python.svg" className="w-4 h-4 object-contain" />
                    <h3 className="text-sm font-bold text-foreground font-sans">Python gVisor Sandbox</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    Execute custom data processing and API calls inside isolated, secure microVM runtimes.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CARD 3: Multi-Agent Teams (Small Bento Card - col-span-1) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="md:col-span-1"
          >
            <Card className="group border border-border bg-card p-6 h-full flex flex-col justify-between overflow-hidden relative rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="space-y-6">
                {/* Circular pulsing agent network mockup */}
                <div className="relative w-full h-[90px] flex items-center justify-center select-none">
                  <div className="absolute w-20 h-20 rounded-full border border-dashed border-border/80 animate-spin" style={{ animationDuration: "12s" }} />
                  
                  <div className="absolute top-0 bg-card border border-border p-1.5 rounded-lg shadow-xs">
                    <img src="https://svgl.app/library/openai.svg" className="w-4 h-4 object-contain" />
                  </div>
                  <div className="absolute bottom-0 left-4 bg-card border border-border p-1.5 rounded-lg shadow-xs">
                    <img src="https://svgl.app/library/deepseek.svg" className="w-4 h-4 object-contain" />
                  </div>
                  <div className="absolute bottom-0 right-4 bg-card border border-border p-1.5 rounded-lg shadow-xs">
                    <img src="https://svgl.app/library/gemini.svg" className="w-4 h-4 object-contain" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground font-sans">Autonomous Routing</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    Assemble collaborative agent pipelines. Delegate tasks dynamically based on intent classifier nodes.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CARD 4: Instant Deployments (Large Bento Card - col-span-2) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="md:col-span-2"
          >
            <Card className="group border border-border bg-card p-6 h-full flex flex-col justify-between overflow-hidden relative rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <Badge variant="secondary" className="text-[9px] font-mono tracking-wider uppercase bg-primary/5 text-primary border border-primary/15 rounded-md px-2 py-0.5">
                    Deploy
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground font-sans flex items-center justify-between">
                    <span>1-Click Serverless Deploy</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    Publish workflows instantly as auto-scaling REST API edge routes. Secure endpoints with access tokens and route request streams natively.
                  </p>
                </div>

                {/* API Request Mockup Column */}
                <div className="lg:col-span-7 p-4 border border-border/60 rounded-xl bg-muted/30 font-mono text-[9.5px] text-muted-foreground leading-relaxed dark:bg-card/10 select-none overflow-x-auto">
                  <span className="text-foreground">$ curl -X POST https://api.nexus.ai/v1/run \</span><br />
                  &nbsp;&nbsp;-H <span className="text-emerald-500">"Authorization: Bearer nx_live_..."</span> \<br />
                  &nbsp;&nbsp;-d <span className="text-emerald-500">{"'{ \"url\": \"https://api.com/v1\" }'"}</span><br />
                  <br />
                  <span className="text-primary">// Response Stream:</span><br />
                  <span className="text-foreground">&#123; "status": "success", "latency_ms": 8, "tokens": 142 &#125;</span>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
