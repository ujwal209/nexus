"use client";

import React from "react";
import { FiAlertCircle, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface Props {
  searchQuery: string;
  onBrowseTemplates: () => void;
}

export function WorkflowEmptyState({ searchQuery, onBrowseTemplates }: Props) {
  return (
    <div className="border border-dashed border-border rounded-xl py-20 flex flex-col items-center gap-4 bg-card/30 text-center">
      <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
        <FiAlertCircle className="w-4.5 h-4.5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          {searchQuery ? "No matching workflows" : "No workflows yet"}
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {searchQuery
            ? `Nothing matches "${searchQuery}". Try adjusting your search.`
            : "Create your first automation pipeline. Pick a template or start from scratch."}
        </p>
      </div>
      {!searchQuery && (
        <Button
          onClick={onBrowseTemplates}
          size="sm"
          className="h-8 px-4 text-xs font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 cursor-pointer flex items-center gap-1.5"
        >
          <FiPlus className="w-3.5 h-3.5" />
          Browse Templates
        </Button>
      )}
    </div>
  );
}
