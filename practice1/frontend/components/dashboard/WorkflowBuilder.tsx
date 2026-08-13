"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FiCpu,
  FiPlay,
  FiRotateCcw,
  FiPlus,
  FiSliders,
  FiCheckCircle,
  FiCode,
  FiTrash2,
  FiX,
  FiArrowLeft,
  FiCloud,
  FiZoomIn,
  FiZoomOut
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { saveWorkflowToBackend } from "@/lib/api";

interface CanvasNode {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  status: string;
  x: number;
  y: number;
  config: any;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

interface WorkflowBuilderProps {
  initialWorkflow: {
    graph_id?: string;
    name: string;
    nodes: CanvasNode[];
    edges: Connection[];
  };
  token: string;
  onBack: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  initialWorkflow,
  token,
  onBack
}) => {
  const [graphName, setGraphName] = useState(initialWorkflow.name || "new_workflow");
  const [nodes, setNodes] = useState<CanvasNode[]>(initialWorkflow.nodes || []);
  const [connections, setConnections] = useState<Connection[]>(initialWorkflow.edges || []);
  
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [propsDialogOpen, setPropsDialogOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Dragging connection wire
  const [connectingStartId, setConnectingStartId] = useState<string | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);

  // Pan State
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Dragging Node State
  const draggingNodeRef = useRef<{ id: string; startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null);

  // Handle Drag Node
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    draggingNodeRef.current = {
      id: nodeId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: node.x,
      startY: node.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeRef.current) {
      const dx = (e.clientX - draggingNodeRef.current.startMouseX) / zoomLevel;
      const dy = (e.clientY - draggingNodeRef.current.startMouseY) / zoomLevel;
      
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeRef.current?.id
            ? { ...n, x: draggingNodeRef.current.startX + dx, y: draggingNodeRef.current.startY + dy }
            : n
        )
      );
    } else if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset({
        x: panOffset.x + dx,
        y: panOffset.y + dy
      });
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }

    if (connectingStartId && canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: (e.clientX - rect.left - panOffset.x) / zoomLevel,
        y: (e.clientY - rect.top - panOffset.y) / zoomLevel
      });
    }
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
    isPanningRef.current = false;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Node Connections
  const handleStartConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingStartId(nodeId);
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: (e.clientX - rect.left - panOffset.x) / zoomLevel,
        y: (e.clientY - rect.top - panOffset.y) / zoomLevel
      });
    }
  };

  const handleCompleteConnection = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (connectingStartId && connectingStartId !== targetId) {
      const exists = connections.some(
        (c) => c.fromId === connectingStartId && c.toId === targetId
      );
      if (!exists) {
        setConnections((prev) => [
          ...prev,
          { id: `c-${Date.now()}`, fromId: connectingStartId, toId: targetId }
        ]);
      }
    }
    setConnectingStartId(null);
    setConnectingMousePos(null);
  };

  const handleDeleteConnection = (connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
  };

  const handleAddNode = (type: string) => {
    const id = `${type}-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type,
      title: `${type.toUpperCase()} Node`,
      subtitle: "Custom pipeline node",
      status: "idle",
      x: Math.round(-panOffset.x / zoomLevel + 150),
      y: Math.round(-panOffset.y / zoomLevel + 150),
      config: type === "llm" ? { model: "gpt-4o", prompt: "Hello {{context}}" } : {}
    };

    setNodes((prev) => [...prev, newNode]);
    setCatalogOpen(false);
  };

  const handleDeleteNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) =>
      prev.filter((c) => c.fromId !== nodeId && c.toId !== nodeId)
    );
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setPropsDialogOpen(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      graph_id: graphName,
      name: graphName,
      engine: "nexus_agent_v2",
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        subtitle: n.subtitle,
        config: n.config,
        position: { x: Math.round(n.x), y: Math.round(n.y) }
      })),
      edges: connections
    };

    try {
      await saveWorkflowToBackend(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    // Simulating sequence log runs
    setNodes((prev) => prev.map((n) => ({ ...n, status: "running" })));
    setTimeout(() => {
      setNodes((prev) => prev.map((n) => ({ ...n, status: "success" })));
      setIsRunning(false);
    }, 2000);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col font-sans relative overflow-hidden select-none bg-background">
      
      {/* 1. Top Panel Toolbar */}
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="h-8 rounded-md border border-border px-2.5 cursor-pointer">
            <FiArrowLeft className="h-4 w-4 mr-1" />
            <span>Workflows</span>
          </Button>

          <Input
            value={graphName}
            onChange={(e) => setGraphName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
            className="h-8 font-bold text-xs bg-transparent border-none focus-visible:ring-0 w-44 text-foreground px-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCatalogOpen(true)}
            className="h-8 text-xs font-semibold rounded-md border border-border cursor-pointer"
          >
            <FiPlus className="h-3.5 w-3.5 mr-1" />
            <span>Add Node</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs font-semibold rounded-md border border-border cursor-pointer"
          >
            <FiCloud className="h-3.5 w-3.5 mr-1" />
            <span>{isSaving ? "Saving..." : "Save Canvas"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="h-8 text-xs font-semibold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-sm"
          >
            <FiPlay className="h-3.5 w-3.5 mr-1" />
            <span>{isRunning ? "Running..." : "Test Pipeline"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Interactive SVG Canvas Viewport */}
      <div
        ref={canvasContainerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleCanvasMouseDown}
        className="flex-1 relative overflow-hidden bg-background bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px]"
      >
        {/* Pan Zoom Group */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: "0 0"
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
              </marker>
            </defs>

            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.fromId);
              const toNode = nodes.find((n) => n.id === conn.toId);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 220;
              const y1 = fromNode.y + 35;
              const x2 = toNode.x;
              const y2 = toNode.y + 35;

              const dx = Math.abs(x2 - x1) * 0.5;
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <g key={conn.id} className="group pointer-events-auto">
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    onClick={() => handleDeleteConnection(conn.id)}
                    className="cursor-pointer"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="2.5"
                    className="group-hover:stroke-red-500 transition-colors"
                  />
                </g>
              );
            })}

            {/* Connecting Wire */}
            {connectingStartId && connectingMousePos && (() => {
              const source = nodes.find((n) => n.id === connectingStartId);
              if (!source) return null;
              const x1 = source.x + 220;
              const y1 = source.y + 35;
              const x2 = connectingMousePos.x;
              const y2 = connectingMousePos.y;
              const dx = Math.abs(x2 - x1) * 0.5;
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
              );
            })()}
          </svg>

          {/* Node Render Group */}
          <div className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onDoubleClick={() => {
                    setSelectedNodeId(node.id);
                    setPropsDialogOpen(true);
                  }}
                  style={{ left: node.x, top: node.y }}
                  className={`absolute w-56 p-4 rounded-lg bg-card border text-foreground shadow-xs pointer-events-auto cursor-grab active:cursor-grabbing select-none transition-shadow ${
                    isSelected ? "border-primary shadow-md" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FiCpu className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs font-bold text-foreground truncate block leading-tight">
                        {node.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteNode(node.id, e)}
                      className="text-muted-foreground hover:text-red-500 p-0.5 cursor-pointer shrink-0"
                    >
                      <FiX className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-muted-foreground block truncate mb-3">
                    {node.subtitle}
                  </span>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[8px] font-mono uppercase tracking-wider ${
                        node.status === "success"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : node.status === "running"
                          ? "bg-primary/10 text-primary border-primary/20 animate-pulse"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {node.status}
                    </Badge>

                    {/* Output Anchor Point */}
                    <div
                      onMouseDown={(e) => handleStartConnection(e, node.id)}
                      onMouseUp={(e) => handleCompleteConnection(e, node.id)}
                      className="h-3.5 w-3.5 rounded-full bg-muted hover:bg-primary border border-border flex items-center justify-center cursor-pointer transition-colors shadow-2xs hover:scale-110"
                      title="Link Connector"
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* 3. Catalog Drawer Modal */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-w-md bg-background border border-border p-6 rounded-lg font-sans">
          <DialogTitle className="text-sm font-bold text-foreground">Add Canvas Node</DialogTitle>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { type: "trigger", label: "Webhook Trigger", desc: "Start execution flow" },
              { type: "llm", label: "LLM Node", desc: "Run GPT/Claude model" },
              { type: "python", label: "Python Sandbox VM", desc: "Run custom scripts" },
              { type: "js", label: "JS Sandbox VM", desc: "Run custom NodeJS functions" },
              { type: "postgres", label: "PostgreSQL Database", desc: "Run structured queries" },
              { type: "slack", label: "Slack webhook", desc: "Post channels notifications" }
            ].map((nodeInfo) => (
              <button
                key={nodeInfo.type}
                onClick={() => handleAddNode(nodeInfo.type)}
                className="p-4 rounded-md border border-border bg-card hover:border-foreground/30 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-xs text-foreground block">{nodeInfo.label}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 leading-normal block">{nodeInfo.desc}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Edit Parameter Sheet Modal */}
      <Dialog open={propsDialogOpen} onOpenChange={setPropsDialogOpen}>
        {selectedNode && (
          <DialogContent className="max-w-lg bg-background border border-border p-6 rounded-lg font-sans overflow-y-auto max-h-[85vh]">
            <DialogTitle className="text-sm font-bold text-foreground mb-4">
              Configure `{selectedNode.title}`
            </DialogTitle>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Node Label</Label>
                <Input
                  value={selectedNode.title}
                  onChange={(e) =>
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id ? { ...n, title: e.target.value } : n
                      )
                    )
                  }
                  className="h-9 text-xs"
                />
              </div>

              {selectedNode.type === "llm" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">LLM Prompt Template</Label>
                    <textarea
                      value={selectedNode.config.prompt || ""}
                      onChange={(e) =>
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, prompt: e.target.value } }
                              : n
                          )
                        )
                      }
                      rows={5}
                      className="w-full text-xs font-mono p-3 bg-muted border border-border rounded-md text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                    />
                  </div>
                </>
              )}

              {(selectedNode.type === "python" || selectedNode.type === "js") && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Custom Script Sandbox Code</Label>
                    <textarea
                      value={selectedNode.config.script || ""}
                      onChange={(e) =>
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, script: e.target.value } }
                              : n
                          )
                        )
                      }
                      rows={6}
                      className="w-full text-xs font-mono p-3 bg-muted border border-border rounded-md text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-6">
              <Button
                size="sm"
                onClick={() => setPropsDialogOpen(false)}
                className="h-9 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-md text-xs cursor-pointer px-5"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

    </div>
  );
};
