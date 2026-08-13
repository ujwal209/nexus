import { PaletteNodeDef } from "./types";

export const LLM_PROVIDERS = [
  {
    id: "anthropic",
    name: "Anthropic",
    logoUrl: "https://svgl.app/library/anthropic_black.svg",
    colorClass: "bg-amber-600",
    models: [
      { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", desc: "Hybrid Reasoning & High-Speed Synthesis", badge: "NEW 3.7" },
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet v2", desc: "State-of-the-art Coding & Complex Reasoning" },
      { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku", desc: "Sub-100ms Ultra Fast Execution" },
      { id: "claude-3-opus", name: "Claude 3 Opus", desc: "Deep Knowledge & Analysis Frontier" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    logoUrl: "https://svgl.app/library/openai.svg",
    colorClass: "bg-emerald-600",
    models: [
      { id: "gpt-4o", name: "GPT-4o Multimodal", desc: "Omni Audio, Vision & Text Model" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Lightweight High Speed Multimodal" },
      { id: "o3-mini", name: "OpenAI o3-mini", desc: "High-Efficiency STEM & Code Reasoning", badge: "REASONING" },
      { id: "o1", name: "OpenAI o1", desc: "Frontier Math & Deep Reasoning" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", desc: "128k Context Production Model" },
    ],
  },
  {
    id: "google",
    name: "Google Gemini",
    logoUrl: "https://svgl.app/library/gemini.svg",
    colorClass: "bg-sky-600",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", desc: "Next-gen Multimodal Realtime Engine", badge: "FLASH 2.0" },
      { id: "gemini-2.0-flash-thinking", name: "Gemini 2.0 Flash Thinking", desc: "Realtime Chain-of-Thought Reasoning", badge: "THINKING" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", desc: "2 Million Token Massive Context" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", desc: "High Velocity Production Engine" },
    ],
  },
  {
    id: "groq",
    name: "Groq LPU",
    logoUrl: "https://svgl.app/library/groq.svg",
    colorClass: "bg-orange-600",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", desc: "500+ Tokens/sec LPU Inference", badge: "500 TPS" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B", desc: "Ultra-fast Distilled Reasoning on Groq", badge: "GROQ LPU" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B MoE", desc: "Fast Sparse Mixture-of-Experts" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B IT", desc: "High-speed Google Gemma on Groq" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek AI",
    logoUrl: "https://svgl.app/library/deepseek.svg",
    colorClass: "bg-blue-600",
    models: [
      { id: "deepseek-r1", name: "DeepSeek R1", desc: "Open-weights Frontier Reasoning Engine", badge: "REASONING" },
      { id: "deepseek-v3", name: "DeepSeek V3", desc: "671B Parameter MoE General Engine" },
      { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", desc: "Specialized 338+ Language Code Model" },
    ],
  },
  {
    id: "meta",
    name: "Meta Llama",
    logoUrl: "https://svgl.app/library/meta.svg",
    colorClass: "bg-blue-700",
    models: [
      { id: "llama-3.3-70b-instruct", name: "Llama 3.3 70B Instruct", desc: "SOTA Open Source 70B Instruct" },
      { id: "llama-3.1-405b-instruct", name: "Llama 3.1 405B Frontier", desc: "Massive 405B Parameter Frontier Model" },
      { id: "llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct", desc: "Fast Edge & On-Device Model" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    logoUrl: "https://svgl.app/library/mistral-ai_logo.svg",
    colorClass: "bg-amber-700",
    models: [
      { id: "mistral-large-2411", name: "Mistral Large 2", desc: "128k Context Multilingual Reasoning" },
      { id: "codestral-2501", name: "Codestral 2501", desc: "Specialized Software Engineering LLM" },
      { id: "pixtral-12b", name: "Pixtral 12B Multimodal", desc: "Vision & Document Understanding" },
      { id: "mistral-nemo", name: "Mistral NeMo 12B", desc: "NVIDIA Co-Developed High-Efficiency Engine" },
    ],
  },
  {
    id: "cohere",
    name: "Cohere",
    logoUrl: "https://svgl.app/library/cohere.svg",
    colorClass: "bg-teal-700",
    models: [
      { id: "command-r-plus", name: "Command R+", desc: "Enterprise RAG & Tool Calling Leader" },
      { id: "command-r", name: "Command R", desc: "128k Multilingual RAG Model" },
    ],
  },
];

export const PALETTE_CATALOG: PaletteNodeDef[] = [
  // Triggers
  { type: "trigger", title: "Webhook Trigger", subtitle: "HTTP Event Endpoint", category: "Triggers", iconUrl: "https://svgl.app/library/postman.svg", colorClass: "" },
  { type: "trigger", title: "Cron Schedule", subtitle: "Interval Scheduler", category: "Triggers", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/clockify.svg", colorClass: "" },
  { type: "trigger", title: "Gmail Listener (Incoming)", subtitle: "Fires on new unread email", category: "Triggers", iconUrl: "https://svgl.app/library/gmail.svg", colorClass: "" },
  { type: "trigger", title: "Stripe Event", subtitle: "Payment Trigger", category: "Triggers", iconUrl: "https://svgl.app/library/stripe.svg", colorClass: "" },
  { type: "trigger", title: "Telegram Bot", subtitle: "Incoming Message", category: "Triggers", iconUrl: "https://svgl.app/library/telegram.svg", colorClass: "" },
  { type: "trigger", title: "Slack Event", subtitle: "Message Mention", category: "Triggers", iconUrl: "https://svgl.app/library/slack.svg", colorClass: "" },
  { type: "trigger", title: "GitHub Webhook", subtitle: "Push & PR Events", category: "Triggers", iconUrl: "https://svgl.app/library/github_light.svg", colorClass: "" },
  // LLM Providers
  { type: "llm", title: "Anthropic Claude", subtitle: "Claude 3.7 & 3.5 Sonnet", category: "LLM Providers", iconUrl: "https://svgl.app/library/anthropic_black.svg", colorClass: "" },
  { type: "llm", title: "OpenAI GPT & o3", subtitle: "GPT-4o & o3-mini", category: "LLM Providers", iconUrl: "https://svgl.app/library/openai.svg", colorClass: "" },
  { type: "llm", title: "Google Gemini", subtitle: "Gemini 2.0 & 1.5 Pro", category: "LLM Providers", iconUrl: "https://svgl.app/library/gemini.svg", colorClass: "" },
  { type: "llm", title: "Groq LPU Engine", subtitle: "500+ TPS Llama & DeepSeek", category: "LLM Providers", iconUrl: "https://svgl.app/library/groq.svg", colorClass: "" },
  { type: "llm", title: "DeepSeek R1 / V3", subtitle: "Reasoning & MoE Engine", category: "LLM Providers", iconUrl: "https://svgl.app/library/deepseek.svg", colorClass: "" },
  { type: "llm", title: "Meta Llama 3.3", subtitle: "70B & 405B Instruct", category: "LLM Providers", iconUrl: "https://svgl.app/library/meta.svg", colorClass: "" },
  { type: "llm", title: "Mistral Large 2", subtitle: "128k Codestral & NeMo", category: "LLM Providers", iconUrl: "https://svgl.app/library/mistral-ai_logo.svg", colorClass: "" },
  { type: "llm", title: "Cohere Command R+", subtitle: "Enterprise RAG Leader", category: "LLM Providers", iconUrl: "https://svgl.app/library/cohere.svg", colorClass: "" },
  // Developer Tools
  { type: "tool", title: "REST API Client", subtitle: "HTTP Webhook Requests", category: "Developer Tools", iconUrl: "https://svgl.app/library/postman.svg", colorClass: "" },
  { type: "tool", title: "Tavily Search", subtitle: "Web Research Tool", category: "Developer Tools", iconUrl: "https://avatars.githubusercontent.com/u/127116773?s=200&v=4", colorClass: "" },
  { type: "tool", title: "Python Sandbox", subtitle: "gVisor MicroVM", category: "Developer Tools", iconUrl: "https://svgl.app/library/python.svg", colorClass: "" },
  { type: "tool", title: "JavaScript VM", subtitle: "Node.js Runner", category: "Developer Tools", iconUrl: "https://svgl.app/library/javascript.svg", colorClass: "" },
  { type: "tool", title: "Docker Executor", subtitle: "Container Task", category: "Developer Tools", iconUrl: "https://svgl.app/library/docker.svg", colorClass: "" },
  { type: "tool", title: "Perplexity AI", subtitle: "Factual Search", category: "Developer Tools", iconUrl: "https://svgl.app/library/perplexity.svg", colorClass: "" },
  { type: "tool", title: "Wolfram Alpha", subtitle: "Math & Computations", category: "Developer Tools", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/wolfram.svg", colorClass: "" },
  // Apps & APIs
  { type: "app", title: "Slack Bot", subtitle: "Channel Alert", category: "Apps & APIs", iconUrl: "https://svgl.app/library/slack.svg", colorClass: "" },
  { type: "app", title: "GitHub API", subtitle: "PR Audit Runner", category: "Apps & APIs", iconUrl: "https://svgl.app/library/github_light.svg", colorClass: "" },
  { type: "app", title: "Discord Bot", subtitle: "Community Messages", category: "Apps & APIs", iconUrl: "https://svgl.app/library/discord.svg", colorClass: "" },
  { type: "app", title: "Notion Sync", subtitle: "Workspace Pages", category: "Apps & APIs", iconUrl: "https://svgl.app/library/notion.svg", colorClass: "" },
  { type: "app", title: "Airtable API", subtitle: "Relational Records", category: "Apps & APIs", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/airtable.svg", colorClass: "" },
  { type: "app", title: "HubSpot CRM", subtitle: "Lead Workflows", category: "Apps & APIs", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/hubspot.svg", colorClass: "" },
  { type: "app", title: "Linear Sync", subtitle: "Issue Tracker", category: "Apps & APIs", iconUrl: "https://svgl.app/library/linear.svg", colorClass: "" },
  { type: "app", title: "Gmail Sender (Outgoing)", subtitle: "Send outbound HTML email", category: "Apps & APIs", iconUrl: "https://svgl.app/library/gmail.svg", colorClass: "" },
  // Databases & Memory
  { type: "memory", title: "Pinecone Vector", subtitle: "RAG Embeddings", category: "Databases & Memory", iconUrl: "https://avatars.githubusercontent.com/u/74384617?s=200&v=4", colorClass: "" },
  { type: "database", title: "PostgreSQL", subtitle: "Relational SQL", category: "Databases & Memory", iconUrl: "https://svgl.app/library/postgresql.svg", colorClass: "" },
  { type: "database", title: "MongoDB", subtitle: "NoSQL Database", category: "Databases & Memory", iconUrl: "https://svgl.app/library/mongodb-icon-light.svg", colorClass: "" },
  { type: "database", title: "Redis Buffer", subtitle: "In-Memory Store", category: "Databases & Memory", iconUrl: "https://svgl.app/library/redis.svg", colorClass: "" },
  { type: "database", title: "Supabase DB", subtitle: "Postgres + Realtime", category: "Databases & Memory", iconUrl: "https://svgl.app/library/supabase.svg", colorClass: "" },
  { type: "memory", title: "Qdrant Vector", subtitle: "High Performance RAG", category: "Databases & Memory", iconUrl: "https://svgl.app/library/qdrant-icon-light.svg", colorClass: "" },
];

export const CATEGORY_TABS = [
  "All",
  "LLM Providers",
  "Triggers",
  "Developer Tools",
  "Apps & APIs",
  "Databases & Memory",
];
