"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface JsonExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  graphJson: string;
}

export function JsonExportDialog({ open, onOpenChange, graphJson }: JsonExportDialogProps) {
  const [jsonCopied, setJsonCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(graphJson);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-xl rounded-lg bg-background border border-border p-6 font-sans shadow-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">Compiled AST Schema</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Production AST workflow JSON schema deployed to NEXUS Edge Cloud.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="absolute right-3 top-3 h-7 text-xs font-medium rounded-md bg-background border-border cursor-pointer"
          >
            <span>{jsonCopied ? "Copied" : "Copy JSON"}</span>
          </Button>
          <pre className="bg-muted p-4 rounded-md border border-border text-xs font-mono text-foreground max-h-60 overflow-y-auto leading-normal">
            {graphJson}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
