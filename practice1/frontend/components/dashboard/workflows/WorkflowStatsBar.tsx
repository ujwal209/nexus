"use client";

import React from "react";
import { FiGitBranch, FiZap } from "react-icons/fi";

interface Props {
  totalWorkflows: number;
  totalNodes: number;
}

export function WorkflowStatsBar({ totalWorkflows, totalNodes }: Props) {
  const stats = [
    { label: "Total Workflows", value: totalWorkflows, icon: FiGitBranch },
    { label: "Total Nodes", value: totalNodes, icon: FiZap },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="p-4 rounded-xl border border-border bg-card flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-muted shrink-0">
            <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-xl font-extrabold text-foreground leading-tight">
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
