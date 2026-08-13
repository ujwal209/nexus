"use client";

import React from "react";
import { FiSearch, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "./BrandLogo";
import { PaletteNodeDef } from "./types";

interface NodeCatalogSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  filteredCatalog: PaletteNodeDef[];
  categoryTabs: string[];
  onAddNode: (def: PaletteNodeDef) => void;
  paletteCatalog: PaletteNodeDef[];
}

export function NodeCatalogSidebar({
  collapsed,
  onToggleCollapse,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  filteredCatalog,
  categoryTabs,
  onAddNode,
  paletteCatalog,
}: NodeCatalogSidebarProps) {
  return (
    <aside
      className={`hidden lg:flex ${
        collapsed ? "w-16 p-2" : "w-80 p-4"
      } border-r border-border/80 bg-card flex-col gap-4 shrink-0 z-20 transition-all duration-300 overflow-y-auto custom-thin-scrollbar`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center justify-between w-full pr-2">
            <h3 className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
              Node Catalog ({filteredCatalog.length})
            </h3>
            <Badge variant="outline" className="text-[9px] font-mono bg-primary/10 text-primary border-primary/20">
              NEXUS Studio
            </Badge>
          </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleCollapse}
          className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground shrink-0 ml-auto cursor-pointer"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed ? (
        <>
          {/* Search + category tabs */}
          <div className="sticky top-0 bg-card z-30 pt-1 pb-3 border-b border-border/40 space-y-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search 40+ tools, LLMs & APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 h-8.5 text-xs bg-muted/40 border-border/80 rounded-xl shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-thin-scrollbar">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Categorized grid */}
          <div className="space-y-5">
            {categoryTabs.filter((c) => c !== "All").map((cat) => {
              if (activeCategory !== "All" && activeCategory !== cat) return null;
              const catItems = filteredCatalog.filter((item) => item.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest block px-1">
                    {cat} ({catItems.length})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {catItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => onAddNode(item)}
                        className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/60 hover:border-primary/40 transition-all text-left cursor-pointer shadow-2xs group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-muted/80 border border-border/60 flex items-center justify-center p-1.5 mb-2 group-hover:scale-110 transition-transform overflow-hidden">
                          <BrandLogo url={item.iconUrl} name={item.title} />
                        </div>
                        <span className="font-bold text-xs text-foreground truncate w-full leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[9px] text-muted-foreground truncate w-full mt-0.5">
                          {item.subtitle}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Collapsed: icon-only toolbar */
        <div className="flex flex-col items-center gap-3 pt-2">
          {paletteCatalog.slice(0, 10).map((item, idx) => (
            <button
              key={idx}
              onClick={() => onAddNode(item)}
              title={`Add ${item.title}`}
              className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center p-2 hover:bg-muted hover:border-primary transition-all cursor-pointer shadow-2xs"
            >
              <BrandLogo url={item.iconUrl} name={item.title} />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
