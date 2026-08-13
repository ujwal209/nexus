"use client";

import React, { useState } from "react";
import {
  FiCpu,
  FiArrowRight,
  FiTerminal,
  FiDatabase,
  FiGlobe,
  FiMail,
  FiLayers,
  FiActivity,
  FiGitBranch,
  FiGrid
} from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "AI & Agents" | "Developer Sandboxes" | "Integrations";
  icon: any;
  techStack: string[];
  nodes: any[];
  edges: any[];
}

export const PREBUILT_TEMPLATES: Template[] = [
  {
    id: "ai-search-assistant",
    name: "AI Search Assistant",
    description: "Search web queries and compile comprehensive summaries utilizing Tavily and GPT-4o.",
    category: "AI & Agents",
    icon: FiCpu,
    techStack: ["GPT-4o", "Tavily Search"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Webhook Trigger",
        subtitle: "HTTP Event Listener",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: { webhookUrl: "/api/v1/webhooks/trigger-1" },
      },
      {
        id: "tool-1",
        type: "tool",
        title: "Tavily Web Search",
        subtitle: "Live AI Research",
        status: "idle",
        x: 380,
        y: 60,
        isCollapsed: false,
        iconUrl: "https://avatars.githubusercontent.com/u/127116773?s=200&v=4",
        colorClass: "bg-blue-600",
        config: { searchDepth: "advanced", maxResults: 5, timeout: 30 },
      },
      {
        id: "llm-1",
        type: "llm",
        title: "GPT-4o Engine",
        subtitle: "OpenAI LLM",
        status: "idle",
        x: 720,
        y: 140,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/openai.svg",
        colorClass: "bg-amber-600",
        config: {
          model: "gpt-4o",
          prompt: "Analyze results: {{context}}",
        },
      }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "tool-1" },
      { id: "c2", fromId: "tool-1", toId: "llm-1" }
    ]
  },
  {
    id: "support-ticket-routing",
    name: "Support Sentiment Router",
    description: "Classify support request sentiment with Claude and route notifications directly to Slack.",
    category: "AI & Agents",
    icon: FiGitBranch,
    techStack: ["Claude 3.5", "Slack API"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Webhook Trigger",
        subtitle: "HTTP Event Listener",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: { webhookUrl: "/api/v1/webhooks/trigger-1" },
      },
      {
        id: "llm-1",
        type: "llm",
        title: "Claude 3.5 Sonnet",
        subtitle: "Anthropic Agent Engine",
        status: "idle",
        x: 380,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/anthropic_black.svg",
        colorClass: "bg-amber-600",
        config: {
          model: "claude-3-5-sonnet",
          prompt: "Classify urgency: {{context}}",
        },
      },
      {
        id: "slack-1",
        type: "slack",
        title: "Slack Alerts",
        subtitle: "Post channels notifications",
        status: "idle",
        x: 720,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/slack.svg",
        colorClass: "bg-emerald-600",
        config: {
          webhookUrl: "https://hooks.slack.com/services/test",
          channel: "support",
          message: "Urgent Sentiment Triggered: {{context}}"
        }
      }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "llm-1" },
      { id: "c2", fromId: "llm-1", toId: "slack-1" }
    ]
  },
  {
    id: "sql-analytics-agent",
    name: "SQL Analytics VM Agent",
    description: "Retrieve Postgres database entries and feed them to secure Python Sandbox VM scripts.",
    category: "Developer Sandboxes",
    icon: FiTerminal,
    techStack: ["Python VM", "PostgreSQL", "Claude"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Manual Trigger",
        subtitle: "Manual Start",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: {},
      },
      {
        id: "db-1",
        type: "database",
        title: "PostgreSQL Database",
        subtitle: "Run structured queries",
        status: "idle",
        x: 380,
        y: 60,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postgresql.svg",
        colorClass: "bg-blue-600",
        config: { connectionString: "postgresql://localhost:5432", query: "SELECT * FROM users LIMIT 10" },
      },
      {
        id: "tool-1",
        type: "tool",
        title: "Python Sandbox VM",
        subtitle: "Run custom scripts",
        status: "idle",
        x: 720,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/python.svg",
        colorClass: "bg-amber-600",
        config: {
          script: "import pandas as pd\ndata = {{context}}\nprint(pd.DataFrame(data).describe())"
        },
      }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "db-1" },
      { id: "c2", fromId: "db-1", toId: "tool-1" }
    ]
  },
  {
    id: "vector-db-rag",
    name: "Vector Memory RAG Swarm",
    description: "Index database documents and query Pinecone namespaces with user embeddings.",
    category: "AI & Agents",
    icon: FiDatabase,
    techStack: ["OpenAI", "Pinecone Vector Store"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Manual Trigger",
        subtitle: "Manual Start",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: {},
      },
      {
        id: "db-1",
        type: "database",
        title: "Pinecone Vector",
        subtitle: "RAG Semantic Store",
        status: "idle",
        x: 380,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://avatars.githubusercontent.com/u/74384617?s=200&v=4",
        colorClass: "bg-emerald-600",
        config: { index: "documents", payload: { "vector": [0.1, 0.2] } },
      },
      {
        id: "llm-1",
        type: "llm",
        title: "GPT-4o Engine",
        subtitle: "OpenAI LLM",
        status: "idle",
        x: 720,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/openai.svg",
        colorClass: "bg-amber-600",
        config: {
          model: "gpt-4o",
          prompt: "Summarize Pinecone: {{context}}",
        },
      }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "db-1" },
      { id: "c2", fromId: "db-1", toId: "llm-1" }
    ]
  },
  {
    id: "database-synchronizer",
    name: "Database Synchronizer Script",
    description: "Query databases at interval schedules and synchronize fields using sandboxed JavaScript VM.",
    category: "Developer Sandboxes",
    icon: FiLayers,
    techStack: ["NodeJS VM", "MongoDB", "PostgreSQL"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Manual Trigger",
        subtitle: "Manual Start",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: {},
      },
      {
        id: "tool-1",
        type: "tool",
        title: "NodeJS JS VM",
        subtitle: "Run custom scripts",
        status: "idle",
        x: 380,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/javascript.svg",
        colorClass: "bg-amber-600",
        config: {
          script: "const raw = {{context}};\nreturn raw.map(i => ({...i, updated: true}));"
        },
      }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "tool-1" }
    ]
  },
  {
    id: "autonomous-lead-generator",
    name: "Autonomous Lead Generator",
    description: "Search lead contacts on Tavily, write them to Notion workspace, and alert via email.",
    category: "Integrations",
    icon: FiGlobe,
    techStack: ["Tavily Search", "Notion API", "GPT-4o"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Manual Trigger",
        subtitle: "Manual Start",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: {},
      },
      {
        id: "tool-1",
        type: "tool",
        title: "Tavily Web Search",
        subtitle: "Live AI Research",
        status: "idle",
        x: 380,
        y: 60,
        isCollapsed: false,
        iconUrl: "https://avatars.githubusercontent.com/u/127116773?s=200&v=4",
        colorClass: "bg-blue-600",
        config: { query: "Latest leads" },
      }
    ],
    edges: [
      { id: "c1", fromId: "trigger-1", toId: "tool-1" }
    ]
  },
  {
    id: "system-monitor-swarm",
    name: "System Monitor Swarm",
    description: "Poll Redis triggers, parse server alerts in JS Sandbox, and dispatch to Discord channels.",
    category: "Integrations",
    icon: FiActivity,
    techStack: ["Redis Streams", "JS Script", "Discord Alerts"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Manual Trigger",
        subtitle: "Manual Start",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: {},
      }
    ],
    edges: []
  },
  {
    id: "github-autopilot-triage",
    name: "GitHub Autopilot Triage",
    description: "Receive issue payload webhooks, classify them using Claude 3.7, and create triage comment.",
    category: "Integrations",
    icon: FiLayers,
    techStack: ["Claude 3.7", "GitHub API"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Manual Trigger",
        subtitle: "Manual Start",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: {},
      }
    ],
    edges: []
  },
  {
    id: "financial-reporter-vm",
    name: "Financial Reporter VM",
    description: "Load sheets using Python Pandas, generate HTML graphs, and dispatch emails via SMTP.",
    category: "Developer Sandboxes",
    icon: FiMail,
    techStack: ["Python VM", "OpenAI o3-mini", "SMTP Email"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Manual Trigger",
        subtitle: "Manual Start",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: {},
      }
    ],
    edges: []
  },
  {
    id: "social-scheduler-vm",
    name: "Social Scheduler VM",
    description: "Load content queues at time intervals, parse tags in Node VM, and dispatch to Buffer API.",
    category: "Integrations",
    icon: FiGlobe,
    techStack: ["NodeJS VM", "Buffer API"],
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        title: "Manual Trigger",
        subtitle: "Manual Start",
        status: "idle",
        x: 40,
        y: 120,
        isCollapsed: false,
        iconUrl: "https://svgl.app/library/postman.svg",
        colorClass: "bg-red-600",
        config: {},
      }
    ],
    edges: []
  }
];

interface TemplateChooserProps {
  onSelectTemplate: (template: Template) => void;
  onSelectBlank: () => void;
  onCancel: () => void;
}

export const TemplateChooser: React.FC<TemplateChooserProps> = ({
  onSelectTemplate,
  onSelectBlank,
  onCancel
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "AI & Agents", "Developer Sandboxes", "Integrations"];

  const filteredTemplates = activeCategory === "All"
    ? PREBUILT_TEMPLATES
    : PREBUILT_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Premium Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Choose Blueprint
            <span className="text-[10px] font-mono border border-border px-1.5 py-0.5 rounded text-muted-foreground font-normal">
              10 TEMPLATES
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Select a production-grade template to spin up node graphs instantly.</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-9 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-md cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSelectBlank}
            className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-md cursor-pointer gap-1.5 border border-primary/20"
          >
            <span>Start Blank Canvas</span>
            <FiArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Tabs Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all border cursor-pointer ${
                isActive
                  ? "bg-foreground text-background border-foreground shadow-2xs"
                  : "bg-card border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Templates Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tmpl) => {
          const IconComp = tmpl.icon;
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl)}
              className="p-5 rounded-xl border border-border bg-card hover:border-foreground/35 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs group cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <IconComp className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[8px] font-mono uppercase bg-muted/40 text-muted-foreground border-border">
                    {tmpl.category}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-foreground block group-hover:text-primary transition-colors leading-tight">
                    {tmpl.name}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-normal min-h-[36px]">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-1">
                {tmpl.techStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="text-[9px] font-mono text-muted-foreground bg-muted/20 border-border"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
