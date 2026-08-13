"use client";

import React from "react";
import Link from "next/link";
import { FiCpu, FiCode, FiGlobe, FiDisc } from "react-icons/fi";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-16 text-foreground font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-16">
          
          {/* BRAND */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <FiCpu className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-foreground font-sans">
                NEXUS AI
              </span>
            </Link>
            <p className="text-muted-foreground font-medium max-w-sm leading-relaxed text-sm">
              The production visual node engine for building, orchestrating, and deploying autonomous AI agent systems.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground pt-2">
              <a href="#" className="hover:text-primary transition-colors hover:-translate-y-0.5 block bg-card border border-border p-2.5 rounded-lg shadow-sm" title="Repository">
                <FiCode className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-primary transition-colors hover:-translate-y-0.5 block bg-card border border-border p-2.5 rounded-lg shadow-sm" title="Website">
                <FiGlobe className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-primary transition-colors hover:-translate-y-0.5 block bg-card border border-border p-2.5 rounded-lg shadow-sm" title="Community">
                <FiDisc className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* PRODUCT */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm tracking-wide">Product</h4>
            <ul className="space-y-3 font-medium text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Visual Graph Canvas</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Tool Integrations</a></li>
              <li><a href="#templates" className="hover:text-primary transition-colors">Agent Blueprints</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm tracking-wide">Resources</h4>
            <ul className="space-y-3 font-medium text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Node API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm tracking-wide">Company</h4>
            <ul className="space-y-3 font-medium text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security Audit</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground font-medium text-xs">
          <p>© {new Date().getFullYear()} NEXUS AI INC. ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-2">
            <span>Powered by Next.js & Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
