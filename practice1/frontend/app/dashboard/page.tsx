"use client";

import React, { useState, useContext, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiSearch, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardContext } from "@/context/DashboardContext";
import { WorkflowStatsBar } from "@/components/dashboard/workflows/WorkflowStatsBar";
import { WorkflowTable } from "@/components/dashboard/workflows/WorkflowTable";
import { WorkflowEmptyState } from "@/components/dashboard/workflows/WorkflowEmptyState";
import { WorkflowPagination } from "@/components/dashboard/workflows/WorkflowPagination";
import { PAGE_SIZE } from "@/components/dashboard/workflows/utils";

type SortKey = "name" | "created" | "nodes";

export default function WorkflowsPage() {
  const router = useRouter();
  const context = useContext(DashboardContext);

  // ── State — all hooks unconditional ──
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("created");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const workflows: any[] = context?.workflows ?? [];
  const setWorkflows = context?.setWorkflows;
  const token = context?.token;
  const API_BASE_URL = context?.API_BASE_URL ?? "";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...workflows]
      .filter(
        (w) =>
          w.name?.toLowerCase().includes(q) ||
          w.graph_id?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "nodes")
          return (b.nodes?.length || 0) - (a.nodes?.length || 0);
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      });
  }, [workflows, search, sortBy]);

  // Reset to page 1 on filter / sort change
  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  if (!context) return null;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalNodes = workflows.reduce((acc, w) => acc + (w.nodes?.length || 0), 0);

  const handleDelete = async (graphId: string) => {
    setDeletingId(graphId);
    try {
      const res = await fetch(`${API_BASE_URL}/workflows/${graphId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWorkflows?.((prev: any[]) =>
          prev.filter((w) => w.graph_id !== graphId)
        );
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const openEditor = (graphId: string) =>
    router.push(`/dashboard/workflow/${graphId}`);

  return (
    <motion.div
      key="workflows-manager"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Stats */}
      <WorkflowStatsBar
        totalWorkflows={workflows.length}
        totalNodes={totalNodes}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="pl-9 h-9 text-xs bg-card border-border rounded-lg w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="created">Latest first</option>
            <option value="name">Name A–Z</option>
            <option value="nodes">Most nodes</option>
          </select>
          <Button
            onClick={() => router.push("/dashboard/new")}
            size="sm"
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <FiPlus className="w-3.5 h-3.5" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Table or Empty */}
      {filtered.length > 0 ? (
        <>
          <WorkflowTable
            workflows={paged}
            deletingId={deletingId}
            onEdit={openEditor}
            onDelete={handleDelete}
          />
          <WorkflowPagination
            page={page}
            totalPages={totalPages}
            totalCount={filtered.length}
            searchQuery={search}
            onPageChange={setPage}
          />
        </>
      ) : (
        <WorkflowEmptyState
          searchQuery={search}
          onBrowseTemplates={() => router.push("/dashboard/new")}
        />
      )}
    </motion.div>
  );
}
