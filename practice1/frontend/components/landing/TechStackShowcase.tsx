"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const TechLogos = [
  {
    name: "Groq LPU Engine",
    tag: "LLM Node",
    desc: "Run open-source inference models at extreme speeds exceeding 500+ tokens per second dynamically.",
    iconUrl: "https://svgl.app/library/groq.svg",
  },
  {
    name: "OpenAI GPT-4o",
    tag: "LLM Node",
    desc: "Leverage GPT models for rapid JSON schema compliance, parallel tool calls, and high-speed processing.",
    iconUrl: "https://svgl.app/library/openai.svg",
  },
  {
    name: "Google Gemini",
    tag: "LLM Node",
    desc: "Inject large prompt contexts and leverage multimodal capabilities for analyzing complex assets.",
    iconUrl: "https://svgl.app/library/gemini.svg",
  },
  {
    name: "DeepSeek R1",
    tag: "LLM Node",
    desc: "Run deep chain-of-thought reasoning models to solve complex logic challenges and plans.",
    iconUrl: "https://svgl.app/library/deepseek.svg",
  },
  {
    name: "Python Sandbox",
    tag: "Developer Node",
    desc: "Execute custom data analysis scripts and math functions securely inside isolated gVisor containers.",
    iconUrl: "https://svgl.app/library/python.svg",
  },
  {
    name: "Docker Executor",
    tag: "Developer Node",
    desc: "Provision on-demand container environments to run pre-compiled custom developer scripts.",
    iconUrl: "https://svgl.app/library/docker.svg",
  },
  {
    name: "Tavily Search",
    tag: "Developer Node",
    desc: "Retrieve real-time search summaries, raw page contents, and verified web citations dynamically.",
    iconUrl: "https://avatars.githubusercontent.com/u/127116773?s=200&v=4",
  },
  {
    name: "REST API Client",
    tag: "Developer Node",
    desc: "Perform dynamic HTTP requests (GET, POST, etc.) with custom auth headers and query parameters.",
    iconUrl: "https://svgl.app/library/postman.svg",
  },
];

export const TechStackShowcase: React.FC = () => {
  return (
    <section className="py-20 bg-muted/30 border-y border-border relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="outline" className="text-xs font-mono font-semibold text-primary uppercase tracking-widest px-3.5 py-1.5 bg-primary/10 border-primary/20 rounded-full">
            WORKFLOW NODE LIBRARY
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight font-sans">
            First-Class Integration Library
          </h2>
          <p className="text-base text-muted-foreground font-medium font-sans">
            NEXUS features native, optimized node adapters for your favorite development tools, databases, and AI models.
          </p>
        </div>

        {/* Tech Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TechLogos.map((tech, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col p-6 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md hover:border-primary/30 transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-muted/40 rounded-xl border border-border/50">
                  <img 
                    src={tech.iconUrl} 
                    alt={tech.name} 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground font-sans truncate">{tech.name}</h3>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">{tech.tag}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                {tech.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
