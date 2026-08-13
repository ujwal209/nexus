"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiActivity, FiCopy, FiCheck } from "react-icons/fi";
import { Input } from "@/components/ui/input";

interface ExecutionsLogsTabProps {
  executions: any[];
  workflows: any[];
  isLoadingExecutions: boolean;
  fetchExecutions: () => Promise<void>;
}

// 1. Interactive JSON Syntax Highlighter Component
const JSONPayloadInspector: React.FC<{ payload: any }> = ({ payload }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightJSON = (obj: any) => {
    const jsonStr = JSON.stringify(obj, null, 2);
    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    jsonStr.replace(regex, (match, p1, p2, p3, offset) => {
      if (offset > lastIndex) {
        parts.push(jsonStr.substring(lastIndex, offset));
      }
      
      let cls = "text-amber-400"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-sky-400 font-medium"; // key
        } else {
          cls = "text-emerald-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-purple-400 font-semibold"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-zinc-500 italic"; // null
      }
      
      parts.push(
        <span key={offset} className={cls}>
          {match}
        </span>
      );
      lastIndex = offset + match.length;
      return match;
    });
    
    if (lastIndex < jsonStr.length) {
      parts.push(jsonStr.substring(lastIndex));
    }
    
    return (
      <pre className="font-mono text-[10px] whitespace-pre overflow-x-auto text-zinc-300 leading-relaxed select-text">
        {parts}
      </pre>
    );
  };

  return (
    <div className="border-t border-zinc-800">
      <details className="group">
        <summary className="flex items-center justify-between px-4 py-2 bg-zinc-900/25 hover:bg-zinc-900/40 cursor-pointer select-none text-zinc-400 hover:text-zinc-200">
          <span className="font-bold text-[9px] uppercase tracking-wider">Inspect Output Payload JSON</span>
          <span className="text-[10px] text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="p-4 bg-zinc-950/60 border-t border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-zinc-500">Output Payload Schema</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="text-[9px] text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-zinc-800 hover:bg-zinc-900 cursor-pointer flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <FiCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-2.5 h-2.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-[#050506] rounded border border-zinc-800/50">
            {highlightJSON(payload)}
          </div>
        </div>
      </details>
    </div>
  );
};

// 2. Individual Vercel-Style Terminal Console Box Component
const NodeConsoleBox: React.FC<{
  nid: string;
  nodeRes: any;
  wf: any;
}> = ({ nid, nodeRes, wf }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const nodeHasError = nodeRes.status === "error" || nodeRes.error;
  
  // Extract titles and favicons
  const nodeDef = wf?.nodes?.find((n: any) => n.id === nid);
  const titleRaw = nodeDef?.title || nid;
  const typeRaw = nodeDef?.type || "unknown";
  
  // Resolve name and favicon using our mapper
  const titleLower = titleRaw.toLowerCase();
  const typeLower = typeRaw.toLowerCase();
  let nodeTitle = titleRaw;
  let favicon = "https://svgl.app/library/vercel.svg";

  if (titleLower.includes("gmail") || titleLower.includes("email")) {
    favicon = "https://svgl.app/library/gmail.svg";
    nodeTitle = "Gmail Sender";
  } else if (titleLower.includes("groq")) {
    favicon = "https://svgl.app/library/groq.svg";
    nodeTitle = "Groq LPU Engine";
  } else if (titleLower.includes("claude") || titleLower.includes("anthropic")) {
    favicon = "https://svgl.app/library/anthropic_black.svg";
    nodeTitle = "Anthropic Claude";
  } else if (titleLower.includes("openai") || titleLower.includes("gpt")) {
    favicon = "https://svgl.app/library/openai.svg";
    nodeTitle = "OpenAI GPT";
  } else if (titleLower.includes("gemini") || titleLower.includes("google")) {
    favicon = "https://svgl.app/library/gemini.svg";
    nodeTitle = "Google Gemini";
  } else if (titleLower.includes("stripe")) {
    favicon = "https://svgl.app/library/stripe.svg";
    nodeTitle = "Stripe Webhook";
  } else if (titleLower.includes("tavily") || titleLower.includes("search")) {
    favicon = "https://svgl.app/library/duckduckgo.svg";
    nodeTitle = "Tavily Search";
  } else if (titleLower.includes("slack")) {
    favicon = "https://svgl.app/library/slack.svg";
    nodeTitle = "Slack Notify";
  } else if (titleLower.includes("discord")) {
    favicon = "https://svgl.app/library/discord.svg";
    nodeTitle = "Discord Bot";
  } else if (titleLower.includes("webhook") || typeLower.includes("trigger")) {
    favicon = "https://svgl.app/library/postman.svg";
    nodeTitle = "Webhook Listener";
  }

  // Assemble console logs
  let logs: string[] = [];
  if (nodeRes.output?.execution_audit?.logs) {
    logs = nodeRes.output.execution_audit.logs;
  } else if (nodeRes.execution_audit?.logs) {
    logs = nodeRes.execution_audit.logs;
  } else if (nodeRes.logs) {
    logs = nodeRes.logs;
  }

  if (nodeHasError && nodeRes.message) {
    logs = [...logs, `ERROR: ${nodeRes.message}`];
    if (nodeRes.action) {
      logs = [...logs, `ACTION REQUIRED: ${nodeRes.action}`];
    }
  }

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-lg overflow-hidden font-mono text-[11px] transition-all">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 select-none">
        <div className="flex items-center gap-2">
          <img src={favicon} className="w-3.5 h-3.5 rounded-xs object-contain" alt="" />
          <span className="font-bold text-zinc-100">{nodeTitle}</span>
          <span className="text-[9px] text-zinc-500 font-mono">({nid.slice(0, 8)})</span>
        </div>
        
        {/* Search logs bar & latency metrics */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {logs.length > 0 && (
            <div className="relative w-40 shrink-0">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filter log lines..."
                className="w-full pl-7 pr-4 py-0.5 text-[9px] bg-zinc-950/80 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-zinc-700 font-sans cursor-text"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 font-sans font-bold text-[10px]"
                >
                  ×
                </button>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px]">
              {nodeRes.latency_ms || nodeRes.output?.latency_ms ? `${Math.round(nodeRes.latency_ms || nodeRes.output?.latency_ms)}ms` : ""}
            </span>
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              nodeHasError
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            }`}>
              {nodeRes.status || (nodeRes.error ? "error" : "success")}
            </span>
          </div>
        </div>
      </div>

      {/* Console Logs Terminal */}
      <div className="p-4 space-y-1 max-h-52 overflow-y-auto leading-relaxed bg-[#020203] select-text">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log: string, idx: number) => {
            let logColorClass = "text-zinc-300";
            if (log.toLowerCase().includes("error") || log.toLowerCase().includes("failed") || log.toLowerCase().includes("validation_error")) {
              logColorClass = "text-red-400 font-semibold";
            } else if (log.toLowerCase().includes("success") || log.toLowerCase().includes("ok:") || log.toLowerCase().includes("sent")) {
              logColorClass = "text-emerald-400 font-semibold";
            } else if (log.toLowerCase().includes("init") || log.toLowerCase().includes("dispatch") || log.toLowerCase().includes("connecting")) {
              logColorClass = "text-cyan-400";
            }
            return (
              <div key={idx} className="flex items-start">
                <span className="text-zinc-600 select-none mr-3 w-5 text-right shrink-0">{idx + 1}</span>
                <span className={`${logColorClass} break-all whitespace-pre-wrap`}>{log}</span>
              </div>
            );
          })
        ) : (
          <div className="flex items-start">
            <span className="text-zinc-600 select-none mr-3 w-5 text-right shrink-0">1</span>
            <span className="text-zinc-500 italic">
              {searchTerm ? "No log lines match your search criteria." : "No console logs recorded for this node execution."}
            </span>
          </div>
        )}
      </div>

      {/* Payload JSON Inspector Details */}
      {nodeRes.output && <JSONPayloadInspector payload={nodeRes.output} />}
    </div>
  );
};

export const ExecutionsLogsTab: React.FC<ExecutionsLogsTabProps> = ({
  executions,
  workflows,
  isLoadingExecutions,
  fetchExecutions
}) => {
  const [execSearchQuery, setExecSearchQuery] = useState("");
  const [execStatusFilter, setExecStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [expandedExecId, setExpandedExecId] = useState<string | null>(null);

  const filteredExecutions = executions.filter(exec => {
    const wf = workflows.find((w) => w.graph_id === exec.graph_id);
    const workflowName = wf ? wf.name.toLowerCase() : "";
    const matchesSearch = 
      workflowName.includes(execSearchQuery.toLowerCase()) ||
      exec.graph_id.toLowerCase().includes(execSearchQuery.toLowerCase()) ||
      exec.execution_id.toLowerCase().includes(execSearchQuery.toLowerCase());
    
    if (execStatusFilter === "all") return matchesSearch;
    const isError = exec.status === "failed" || exec.status === "error";
    if (execStatusFilter === "success") return matchesSearch && !isError;
    if (execStatusFilter === "failed") return matchesSearch && isError;
    return matchesSearch;
  });

  return (
    <motion.div
      key="ex"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-foreground">Runs Audit Log</h2>
          <p className="text-xs text-muted-foreground">Real-time execution latency metrics, node payloads, and Vercel-style logs viewer.</p>
        </div>
        <button
          onClick={() => fetchExecutions()}
          disabled={isLoadingExecutions}
          className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer font-bold disabled:opacity-50 self-start md:self-auto shrink-0"
        >
          {isLoadingExecutions ? "Syncing..." : "Refresh Logs"}
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={execSearchQuery}
            onChange={(e) => setExecSearchQuery(e.target.value)}
            placeholder="Search executions by workflow name, graph ID, or run ID..."
            className="pl-9 h-10 text-xs bg-card border-border rounded-md text-foreground focus-visible:ring-foreground"
          />
        </div>
        <div className="flex bg-muted/60 p-0.5 rounded-md border border-border shrink-0 h-10 items-center">
          {(["all", "success", "failed"] as const).map((statusType) => (
            <button
              key={statusType}
              type="button"
              onClick={() => setExecStatusFilter(statusType)}
              className={`text-xs px-3 py-1.5 rounded transition-all font-semibold capitalize cursor-pointer ${
                execStatusFilter === statusType
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {statusType === "all" ? "All Runs" : statusType === "success" ? "Success" : "Failed"}
            </button>
          ))}
        </div>
      </div>
      
      {isLoadingExecutions && executions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-border rounded-lg bg-card text-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading executions audit log from database...</p>
        </div>
      ) : filteredExecutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-border border-dashed rounded-lg bg-card/50 text-center space-y-2">
          <FiActivity className="h-6 w-6 text-muted-foreground/40 mb-1" />
          <h4 className="text-xs font-bold text-foreground">No executions found</h4>
          <p className="text-[11px] text-muted-foreground max-w-xs leading-normal">
            No execution records match your search filter criteria.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 text-[10px] uppercase font-mono font-bold text-muted-foreground tracking-wider grid grid-cols-12 gap-4">
            <span className="col-span-4">Workflow Name / ID</span>
            <span className="col-span-3 text-center">Status</span>
            <span className="col-span-2 text-right">Latency</span>
            <span className="col-span-3 text-right">Executed At</span>
          </div>
          <div className="divide-y divide-border text-xs">
            {filteredExecutions.map((exec) => {
              const wf = workflows.find((w) => w.graph_id === exec.graph_id);
              const workflowName = wf ? wf.name : `Workflow: ${exec.graph_id.slice(0, 8)}`;
              const isExpanded = expandedExecId === exec.execution_id;
              const isError = exec.status === "failed" || exec.status === "error";
              
              // Parse date
              let timeStr = exec.timestamp;
              try {
                timeStr = new Date(exec.timestamp).toLocaleString();
              } catch (e) {}

              return (
                <div key={exec.execution_id} className="transition-colors hover:bg-muted/5">
                  {/* Main row */}
                  <div
                    onClick={() => setExpandedExecId(isExpanded ? null : exec.execution_id)}
                    className="p-4 grid grid-cols-12 gap-4 items-center font-medium cursor-pointer"
                  >
                    <div className="col-span-4 truncate text-foreground flex flex-col gap-0.5">
                      <span className="font-bold">{workflowName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate">{exec.graph_id}</span>
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isError
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      }`}>
                        {exec.status || "COMPLETED"}
                      </span>
                    </div>
                    <span className="col-span-2 font-mono text-right text-muted-foreground">
                      {exec.duration_ms ? `${exec.duration_ms.toFixed(1)} ms` : "N/A"}
                    </span>
                    <span className="col-span-3 text-right text-muted-foreground text-[10px]">
                      {timeStr}
                    </span>
                  </div>

                  {/* Expanded Details - Vercel logs console viewer */}
                  {isExpanded && (
                    <div className="px-6 pb-6 bg-muted/10 border-t border-border/40 space-y-4 pt-4">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <span className="text-[10px] uppercase font-mono font-extrabold text-muted-foreground tracking-wider block">
                          Execution Payloads ({Object.keys(exec.node_results || {}).length} nodes)
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          RUN ID: {exec.execution_id}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        {Object.entries(exec.node_results || {}).map(([nid, nodeRes]: [string, any]) => (
                          <NodeConsoleBox 
                            key={nid} 
                            nid={nid} 
                            nodeRes={nodeRes} 
                            wf={wf} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
