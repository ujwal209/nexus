"use client";

import React from "react";
import Link from "next/link";
import { FiSettings, FiPlus, FiMenu } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CanvasHeaderProps {
  graphId: string;
  graphName: string;
  setGraphName: (v: string) => void;
  graphDescription: string;
  setGraphDescription: (v: string) => void;
  saveStatusText: string;
  isSaving: boolean;
  isRunning: boolean;
  theme: "light" | "dark";
  onSave: () => void;
  onRun: () => void;
  onReset: () => void;
  onToggleTheme: () => void;
  onExportAST: () => void;
  onOpenMobileCatalog: () => void;
  onOpenMobileDashboard: () => void;
}

export function CanvasHeader({
  graphId,
  graphName,
  setGraphName,
  graphDescription,
  setGraphDescription,
  saveStatusText,
  isSaving,
  isRunning,
  theme,
  onSave,
  onRun,
  onReset,
  onToggleTheme,
  onExportAST,
  onOpenMobileCatalog,
  onOpenMobileDashboard,
}: CanvasHeaderProps) {
  const saveLabel =
    saveStatusText === "SAVING..." ? "Saving…" :
    saveStatusText === "SAVE ERROR" ? "Error!" :
    "Saved";

  return (
    <header className="h-14 border-b border-border bg-card px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 gap-2">
      {/* LEFT: Back + Name */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger for Dashboard */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileDashboard}
          className="lg:hidden h-8 w-8 text-foreground shrink-0"
          title="Open Menu"
        >
          <FiMenu className="h-4 w-4" />
        </Button>

        <Button asChild variant="outline" size="sm" className="hidden lg:flex h-8 rounded-md border border-border px-2 shrink-0">
          <Link href="/dashboard" title="Back to Dashboard">
            <span className="text-xs">Back</span>
          </Link>
        </Button>

        {/* Name + description — hidden on very small screens, show truncated */}
        <div className="flex flex-col justify-center lg:border-r border-border pr-2 sm:pr-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Input
              value={graphName}
              onChange={(e) => setGraphName(e.target.value)}
              className="h-7 font-bold text-xs bg-transparent border-none focus-visible:ring-0 w-28 sm:w-44 md:w-56 px-1 text-foreground"
            />
            <div className="shrink-0" title="Autosave Status">
              <span className="text-[9px] font-semibold border border-border px-1.5 py-0.5 rounded text-muted-foreground whitespace-nowrap bg-muted/20 cursor-default">
                {saveLabel}
              </span>
            </div>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer rounded-md shrink-0 hidden sm:flex"
            >
              <Link href={`/dashboard/workflow/${graphId}/configure`} title="Workflow Settings">
                <FiSettings className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <Input
            value={graphDescription}
            onChange={(e) => setGraphDescription(e.target.value)}
            placeholder="Add description…"
            className="h-4 text-[10px] text-muted-foreground bg-transparent border-none focus-visible:ring-0 w-28 sm:w-44 md:w-72 px-1 -mt-1 hidden sm:block"
          />
        </div>

        {/* Reset Canvas — md+ only */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          className="hidden md:flex h-8 text-xs font-medium rounded-md"
        >
          Reset Canvas
        </Button>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile: Add Node button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenMobileCatalog}
          className="lg:hidden h-8 rounded-md border border-border text-xs font-medium cursor-pointer px-2"
        >
          <FiPlus className="w-3.5 h-3.5" />
        </Button>

        {/* Theme toggle — sm+ */}
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleTheme}
          className="hidden sm:flex h-8 rounded-md border border-border text-xs font-medium cursor-pointer"
        >
          {theme === "light" ? "Dark" : "Light"}
        </Button>


        {/* Export AST — md+ */}
        <Button
          size="sm"
          variant="outline"
          onClick={onExportAST}
          className="hidden md:flex h-8 rounded-md border border-border text-xs font-medium cursor-pointer"
        >
          Export AST
        </Button>

        {/* Test Flow — always visible */}
        <Button
          size="sm"
          onClick={onRun}
          disabled={isRunning}
          className="h-8 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium text-xs px-3 sm:px-4 cursor-pointer"
        >
          {isRunning ? "Running…" : "Test Flow"}
        </Button>
      </div>
    </header>
  );
}
