"use client";

import React from "react";
import Link from "next/link";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SecurityDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-accent bg-accent/10 border-accent/20">
            Compliance
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
          Security & SOC2 Type II
        </h1>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          NEXUS AI enforces end-to-end TLS 1.3 encryption, zero-retention data policies, and role-based access control (RBAC).
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-accent font-bold">
            <FiCheckCircle className="h-5 w-5" />
            <span>SOC2 Type II Certified</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our platform undergoes annual third-party security audits to ensure strict data privacy, system availability, and operational integrity.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Return to Introduction</span>
        <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1">
          <Link href="/docs">
            <span>Docs Home</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
