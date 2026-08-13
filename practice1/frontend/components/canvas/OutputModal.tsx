"use client";

import React, { useState } from "react";
import { marked } from "marked";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CanvasNode } from "./types";

interface OutputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOutputNode: CanvasNode | null;
}

export function OutputModal({ open, onOpenChange, selectedOutputNode }: OutputModalProps) {
  const [tab, setTab] = useState<"overview" | "sources" | "json" | "audit">("overview");
  const [exportCopied, setExportCopied] = useState(false);

  if (!selectedOutputNode) return null;

  const handleCopyJson = () => {
    const payload = JSON.stringify(selectedOutputNode.output || { status: "success" }, null, 2);
    navigator.clipboard.writeText(payload);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  const handleExportJson = () => {
    const payload = JSON.stringify(selectedOutputNode.output || { status: "success" }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedOutputNode.title.toLowerCase().replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl lg:max-w-4xl rounded-lg bg-background border border-border shadow-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden font-sans custom-thin-scrollbar">
        <div className="space-y-6 min-w-0 w-full overflow-hidden">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="max-w-full overflow-hidden">
              <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">
                {selectedOutputNode.title} Output
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 break-all max-w-full">
                Query: {selectedOutputNode.output?.query || selectedOutputNode.config?.query || "None"}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="h-8 text-xs font-medium rounded-md cursor-pointer"
              >
                {exportCopied ? "Copied" : "Copy JSON"}
              </Button>

              <Button
                size="sm"
                onClick={handleExportJson}
                className="h-8 text-xs font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
              >
                Export JSON
              </Button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 border-b border-border pb-px text-sm font-medium">
            {(["overview", "sources", "json", "audit"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2 border-b-2 transition-colors cursor-pointer capitalize ${
                  tab === t
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "audit" ? "Logs" : t === "overview" ? "Summary" : t}
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6 max-w-full overflow-hidden">
              {(selectedOutputNode.type === "llm" || selectedOutputNode.output?.system_prompt) && (
                <div className="p-4 rounded-md bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    System Prompt
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {selectedOutputNode.output?.system_prompt || selectedOutputNode.config?.systemPrompt || "None"}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-md border border-border max-w-full overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
                  {selectedOutputNode.type === "llm" || selectedOutputNode.title.toLowerCase().includes("groq")
                    ? "Synthesis Output"
                    : selectedOutputNode.title.toLowerCase().includes("rest") ||
                      selectedOutputNode.title.toLowerCase().includes("webhook") ||
                      selectedOutputNode.title.toLowerCase().includes("http")
                    ? "HTTP Response Body"
                    : "Web Search Briefing"}
                </p>

                <div className="text-sm text-foreground/90 leading-relaxed space-y-4 max-w-full overflow-hidden">
                  {selectedOutputNode.output?.error ? (
                    <div className="p-4 rounded-md bg-muted/50 border border-border">
                      <p className="font-semibold text-foreground mb-2">Execution Failed</p>
                      <p className="text-muted-foreground mb-4">
                        {selectedOutputNode.output?.message || "Unknown error"}
                      </p>
                      {selectedOutputNode.output?.traceback && (
                        <pre className="p-4 rounded-md bg-muted text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {selectedOutputNode.output.traceback}
                        </pre>
                      )}
                    </div>
                  ) : (
                    (() => {
                      const isHttp =
                        selectedOutputNode.title.toLowerCase().includes("rest") ||
                        selectedOutputNode.title.toLowerCase().includes("webhook") ||
                        selectedOutputNode.title.toLowerCase().includes("http");

                      if (isHttp) {
                        const rawBody = selectedOutputNode.output?.response_body || "No response body returned.";
                        let prettyJson = "";
                        try {
                          prettyJson = JSON.stringify(JSON.parse(rawBody), null, 2);
                        } catch {}

                        return (
                          <div className="w-full overflow-hidden rounded-md border border-border bg-muted">
                            <pre className="w-full p-4 text-xs font-mono text-foreground max-h-96 overflow-x-auto overflow-y-auto whitespace-pre leading-normal custom-thin-scrollbar">
                              <code>{prettyJson || rawBody}</code>
                            </pre>
                          </div>
                        );
                      }

                      const rawSummary =
                        selectedOutputNode.output?.summary ||
                        selectedOutputNode.output?.answer ||
                        "Executed successfully. No output generated.";
                      let htmlContent = "";
                      try {
                        htmlContent = marked.parse(rawSummary) as string;
                      } catch {
                        htmlContent = `<p>${rawSummary}</p>`;
                      }
                      return (
                        <div
                          className="markdown-content text-sm text-foreground/90 leading-normal max-w-full overflow-hidden break-words"
                          dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                      );
                    })()
                  )}
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p
                    className={`text-sm font-semibold ${
                      selectedOutputNode.output?.status === "error" || selectedOutputNode.output?.error
                        ? "text-red-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {selectedOutputNode.output?.status === "error" || selectedOutputNode.output?.error
                      ? "Failed"
                      : "Success"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Engine</p>
                  <p className="text-sm font-medium truncate">
                    {selectedOutputNode.output?.model ||
                      (selectedOutputNode.output?.results?.length
                        ? `${selectedOutputNode.output.results.length} Sources`
                        : "Default")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Latency</p>
                  <p className="text-sm font-medium">{selectedOutputNode.output?.latency_ms || 0} ms</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Throughput</p>
                  <p className="text-sm font-medium font-sans">
                    {selectedOutputNode.output?.tps ? `${selectedOutputNode.output.tps} TPS` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SOURCES */}
          {tab === "sources" && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sources ({selectedOutputNode.output?.results?.length || 0})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(selectedOutputNode.output?.results || []).map((res: any, idx: number) => {
                  let domain = "web";
                  try {
                    domain = new URL(res.url).hostname;
                  } catch {}
                  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-md border border-border flex flex-col justify-between space-y-3 bg-background hover:bg-muted/10 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <img
                            src={faviconUrl}
                            alt={domain}
                            className="w-3.5 h-3.5 object-contain shrink-0 rounded-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <span className="text-xs text-muted-foreground truncate">{domain}</span>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium hover:underline line-clamp-2 text-foreground"
                        >
                          {res.title || domain}
                        </a>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                          Relevance Score: {res.score || "1.0"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: JSON */}
          {tab === "json" && (
            <div className="w-full overflow-hidden rounded-md border border-border bg-muted">
              <pre className="w-full p-4 text-xs font-mono text-foreground max-h-96 overflow-x-auto overflow-y-auto whitespace-pre custom-thin-scrollbar">
                {JSON.stringify(selectedOutputNode.output || { status: "success" }, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB: LOGS */}
          {tab === "audit" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Mode</p>
                  <p className="text-sm font-medium truncate">
                    {selectedOutputNode.output?.execution_audit?.execution_mode || "API"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Endpoint</p>
                  <p className="text-sm font-medium truncate">
                    {selectedOutputNode.output?.execution_audit?.endpoint_url || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Key</p>
                  <p className="text-sm font-medium truncate">
                    {selectedOutputNode.output?.execution_audit?.api_key_masked || "Hidden"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Execution Trace
                </p>
                <div className="bg-muted p-4 rounded-md border border-border text-xs font-mono max-h-64 overflow-y-auto space-y-2">
                  {(selectedOutputNode.output?.execution_audit?.logs || ["No logs available."]).map(
                    (line: string, i: number) => (
                      <div key={i} className="text-muted-foreground leading-relaxed">
                        {line}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
