"use client";

import React from "react";
import Link from "next/link";
import { FiDatabase, FiArrowRight } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function VectorNodeDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-accent bg-accent/10 border-accent/20">
            Memory & RAG
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          Vector Database Node
        </h1>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          Store and retrieve semantic embeddings for RAG workflows using Pinecone, Chroma, and Qdrant connectors.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">Supported Vector Databases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-border bg-card rounded-xl text-center">
            <h3 className="font-bold text-sm">Pinecone</h3>
            <p className="text-xs text-muted-foreground mt-1">Serverless Vector Indexing</p>
          </Card>
          <Card className="p-4 border border-border bg-card rounded-xl text-center">
            <h3 className="font-bold text-sm">ChromaDB</h3>
            <p className="text-xs text-muted-foreground mt-1">In-Memory / Self-Hosted</p>
          </Card>
          <Card className="p-4 border border-border bg-card rounded-xl text-center">
            <h3 className="font-bold text-sm">Qdrant</h3>
            <p className="text-xs text-muted-foreground mt-1">High-Throughput Vector Engine</p>
          </Card>
        </div>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Next: Web Tools & Search</span>
        <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1">
          <Link href="/docs/nodes/tools">
            <span>Web Tools</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
