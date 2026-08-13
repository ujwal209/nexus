"use client";

import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export const CodeBlockWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"python" | "typescript" | "curl">("python");
  const [copied, setCopied] = useState(false);

  const rawSnippets = {
    python: `from nexus import AgentClient

# Initialize client with your secret key
client = AgentClient(api_key="nx_live_secret_99482")

# Trigger execution graph synchronously or stream response tokens
response = client.run_graph(
    graph_id="agent_researcher_v2",
    inputs={
        "prompt": "Analyze Next.js 16 App Router updates",
        "search_depth": "deep"
    }
)

print("Agent Response:", response.output)`,
    typescript: `import { NexusClient } from '@nexus-ai/sdk';

// Initialize the TypeScript edge client
const nexus = new NexusClient({ apiKey: process.env.NEXUS_API_KEY });

// Execute graph and receive structured JSON payload
const result = await nexus.runGraph('agent_researcher_v2', {
  prompt: 'Analyze Next.js 16 App Router updates',
  searchDepth: 'deep'
});

console.log('Stream payload:', result.data);`,
    curl: `curl -X POST https://api.nexusai.com/v1/graphs/agent_researcher_v2/run \\
  -H "Authorization: Bearer nx_live_secret_99482" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Analyze Next.js 16 App Router updates",
    "search_depth": "deep"
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-[#0d1117] text-[#c9d1d9] shadow-xl overflow-hidden font-mono min-w-0">
      
      {/* HEADER: TABS & COPY BUTTON */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d] gap-2">
        
        {/* Language Selection Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0d1117] p-1 rounded-xl border border-[#30363d]">
          <button
            onClick={() => setActiveTab("python")}
            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "python"
                ? "bg-primary text-white shadow-xs"
                : "text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            Python
          </button>
          <button
            onClick={() => setActiveTab("typescript")}
            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "typescript"
                ? "bg-primary text-white shadow-xs"
                : "text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            TypeScript
          </button>
          <button
            onClick={() => setActiveTab("curl")}
            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "curl"
                ? "bg-primary text-white shadow-xs"
                : "text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            cURL
          </button>
        </div>

        {/* Copy Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2.5 text-[11px] font-bold gap-1.5 bg-[#0d1117] border-[#30363d] hover:bg-[#21262d] text-[#c9d1d9] rounded-xl shadow-xs"
        >
          {copied ? <FiCheck className="h-3.5 w-3.5 text-accent" /> : <FiCopy className="h-3.5 w-3.5 text-[#8b949e]" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>

      {/* SYNTAX HIGHLIGHTED CODE BODY */}
      <div className="p-4 sm:p-5 overflow-x-auto text-[11px] sm:text-xs leading-relaxed">
        {activeTab === "python" && <PythonSnippet />}
        {activeTab === "typescript" && <TypeScriptSnippet />}
        {activeTab === "curl" && <CurlSnippet />}
      </div>

    </div>
  );
};

// SYNTAX HIGHLIGHTED COMPONENTS (VS Code Dark Theme - Safe Escaped Strings)
function PythonSnippet() {
  return (
    <pre className="font-mono whitespace-pre leading-relaxed">
      <span className="text-[#ff7b72] font-semibold">from</span> nexus <span className="text-[#ff7b72] font-semibold">import</span> <span className="text-[#ffa657]">AgentClient</span>{"\n\n"}
      <span className="text-[#8b949e] italic"># Initialize client with your secret key</span>{"\n"}
      client = <span className="text-[#d2a8ff]">AgentClient</span>(api_key=<span className="text-[#a5d6ff]">"nx_live_secret_99482"</span>){"\n\n"}
      <span className="text-[#8b949e] italic"># Trigger execution graph synchronously or stream response tokens</span>{"\n"}
      response = client.<span className="text-[#d2a8ff]">run_graph</span>({"\n"}
      {"    "}<span className="text-[#79c0ff]">graph_id</span>=<span className="text-[#a5d6ff]">"agent_researcher_v2"</span>,{"\n"}
      {"    "}<span className="text-[#79c0ff]">inputs</span>=&#123;{"\n"}
      {"        "}<span className="text-[#a5d6ff]">"prompt"</span>: <span className="text-[#a5d6ff]">"Analyze Next.js 16 App Router updates"</span>,{"\n"}
      {"        "}<span className="text-[#a5d6ff]">"search_depth"</span>: <span className="text-[#a5d6ff]">"deep"</span>{"\n"}
      {"    "}&#125;{"\n"}
      ){"\n\n"}
      <span className="text-[#79c0ff]">print</span>(<span className="text-[#a5d6ff]">"Agent Response:"</span>, response.output)
    </pre>
  );
}

function TypeScriptSnippet() {
  return (
    <pre className="font-mono whitespace-pre leading-relaxed">
      <span className="text-[#ff7b72] font-semibold">import</span> &#123; <span className="text-[#ffa657]">NexusClient</span> &#125; <span className="text-[#ff7b72] font-semibold">from</span> <span className="text-[#a5d6ff]">{"'@nexus-ai/sdk'"}</span>;{"\n\n"}
      <span className="text-[#8b949e] italic">// Initialize the TypeScript edge client</span>{"\n"}
      <span className="text-[#ff7b72]">const</span> nexus = <span className="text-[#ff7b72]">new</span> <span className="text-[#d2a8ff]">NexusClient</span>(&#123; apiKey: process.env.<span className="text-[#79c0ff]">NEXUS_API_KEY</span> &#125;);{"\n\n"}
      <span className="text-[#8b949e] italic">// Execute graph and receive structured JSON payload</span>{"\n"}
      <span className="text-[#ff7b72]">const</span> result = <span className="text-[#ff7b72]">await</span> nexus.<span className="text-[#d2a8ff]">runGraph</span>(<span className="text-[#a5d6ff]">{"'agent_researcher_v2'"}</span>, &#123;{"\n"}
      {"  "}<span className="text-[#79c0ff]">prompt</span>: <span className="text-[#a5d6ff]">{"'Analyze Next.js 16 App Router updates'"}</span>,{"\n"}
      {"  "}<span className="text-[#79c0ff]">searchDepth</span>: <span className="text-[#a5d6ff]">{"'deep'"}</span>{"\n"}
      &#125;);{"\n\n"}
      console.<span className="text-[#d2a8ff]">log</span>(<span className="text-[#a5d6ff]">{"'Stream payload:'"}</span>, result.data);
    </pre>
  );
}

function CurlSnippet() {
  return (
    <pre className="font-mono whitespace-pre leading-relaxed">
      <span className="text-[#79c0ff] font-semibold">curl</span> -X <span className="text-[#ffa657] font-bold">POST</span> <span className="text-[#a5d6ff]">https://api.nexusai.com/v1/graphs/agent_researcher_v2/run</span> \{"\n"}
      {"  "}-H <span className="text-[#a5d6ff]">"Authorization: Bearer nx_live_secret_99482"</span> \{"\n"}
      {"  "}-H <span className="text-[#a5d6ff]">"Content-Type: application/json"</span> \{"\n"}
      {"  "}-d <span className="text-[#a5d6ff] font-semibold">{"'{\"prompt\": \"Analyze Next.js 16 App Router updates\", \"search_depth\": \"deep\"}'"}</span>
    </pre>
  );
}
