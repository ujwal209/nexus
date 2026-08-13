"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "./BrandLogo";
import { PaletteNodeDef } from "./types";

interface MobileNodeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredCatalog: PaletteNodeDef[];
  onAddNode: (def: PaletteNodeDef) => void;
}

export function MobileNodeDrawer({
  open,
  onOpenChange,
  searchQuery,
  setSearchQuery,
  filteredCatalog,
  onAddNode,
}: MobileNodeDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:hidden w-[95vw] rounded-lg bg-background border border-border max-h-[85vh] overflow-y-auto p-5 font-sans">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-sm font-semibold flex items-center justify-between text-foreground">
            <span>Node Tool Catalog</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-border rounded text-muted-foreground">
              {filteredCatalog.length} Tools
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Input
            placeholder="Search 40+ tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-xs"
          />

          <div className="grid grid-cols-2 gap-2">
            {filteredCatalog.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onAddNode(item)}
                className="flex flex-col items-start p-3 rounded-xl border border-border bg-background text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center p-1.5 mb-2">
                  <BrandLogo url={item.iconUrl} name={item.title} />
                </div>
                <span className="font-bold text-xs text-foreground truncate w-full">{item.title}</span>
                <span className="text-[9px] text-muted-foreground truncate w-full">{item.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
