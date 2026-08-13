"use client";

import React, { useState } from "react";
import { FiGitBranch, FiClock, FiCheckCircle, FiCopy } from "react-icons/fi";
import { WorkflowRowMenu } from "./WorkflowRowMenu";
import { formatRelativeTime } from "./utils";

interface Workflow {
  graph_id: string;
  name?: string;
  nodes?: any[];
  updated_at?: string;
  created_at?: string;
}

interface Props {
  workflows: Workflow[];
  deletingId: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
      title="Copy ID"
    >
      {copied ? (
        <FiCheckCircle className="w-3 h-3" />
      ) : (
        <FiCopy className="w-3 h-3" />
      )}
    </button>
  );
}

export function WorkflowTable({ workflows, deletingId, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Desktop table header — hidden on mobile */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-border bg-muted/20 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="col-span-5">Workflow</span>
        <span className="col-span-2 text-center">Nodes</span>
        <span className="col-span-2 text-center">Status</span>
        <span className="col-span-2 text-center">Modified</span>
        <span className="col-span-1" />
      </div>

      <div className="divide-y divide-border">
        {workflows.map((flow) => {
          const nodeCount = flow.nodes?.length ?? 0;
          const isDeleting = deletingId === flow.graph_id;
          const modified = formatRelativeTime(flow.updated_at || flow.created_at);

          return (
            <div
              key={flow.graph_id}
              role="button"
              tabIndex={0}
              onClick={() => !isDeleting && onEdit(flow.graph_id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isDeleting) onEdit(flow.graph_id);
              }}
              className={`group transition-colors select-none ${
                isDeleting
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-muted/10 cursor-pointer"
              }`}
            >
              {/* ── Desktop row (md+) ── */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 items-center text-xs">
                {/* Name + ID */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md border border-border bg-muted/40 flex items-center justify-center shrink-0">
                    <FiGitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-semibold text-foreground truncate text-[13px]">
                      {flow.name || "Untitled Workflow"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                      <span className="truncate max-w-[130px]">{flow.graph_id}</span>
                      <CopyButton text={flow.graph_id} />
                    </span>
                  </div>
                </div>

                {/* Nodes */}
                <div className="col-span-2 flex justify-center">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    Active
                  </span>
                </div>

                {/* Modified */}
                <div className="col-span-2 flex justify-center items-center gap-1 text-muted-foreground">
                  <FiClock className="w-3 h-3 shrink-0" />
                  <span className="text-[10px]">{modified}</span>
                </div>

                {/* Menu */}
                <div className="col-span-1 flex justify-end">
                  <WorkflowRowMenu
                    onEdit={() => onEdit(flow.graph_id)}
                    onDelete={() => onDelete(flow.graph_id)}
                    isDeleting={isDeleting}
                  />
                </div>
              </div>

              {/* ── Mobile card row (< md) ── */}
              <div className="md:hidden flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-md border border-border bg-muted/40 flex items-center justify-center shrink-0">
                  <FiGitBranch className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {flow.name || "Untitled Workflow"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]">
                      {flow.graph_id}
                    </span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">
                      {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{modified}</span>
                  </div>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <WorkflowRowMenu
                    onEdit={() => onEdit(flow.graph_id)}
                    onDelete={() => onDelete(flow.graph_id)}
                    isDeleting={isDeleting}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
