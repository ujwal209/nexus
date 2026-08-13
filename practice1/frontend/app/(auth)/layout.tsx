"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Sync Theme on Mount
  useEffect(() => {
    const saved = localStorage.getItem("nexus-theme");
    const currentTheme = saved || "dark";
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground transition-colors duration-200">
      
      {/* LEFT SIDE: Authentication Form (Scrollable on small screens) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-5 sm:p-10 lg:p-20 relative z-10">
        
        {/* Back to Home / Logo */}
        <div className="absolute top-5 left-5 sm:top-8 sm:left-8">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <span className="text-base font-extrabold tracking-tight text-foreground font-sans">
              NEXUS <span className="text-primary font-light">STUDIO</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto mt-16 md:mt-0">
          {children}
        </div>
      </div>

      {/* RIGHT SIDE: Branding & Features (Hidden on mobile, 50% width on desktop) */}
      <div className="hidden md:flex w-1/2 bg-card border-l border-border relative overflow-hidden flex-col justify-center p-12 lg:p-20">
        
        {/* Subtle dot mesh/radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight font-sans mb-6">
            Build production-ready <br/>
            <span className="text-primary">multi-agent systems</span>.
          </h2>
          <p className="text-sm lg:text-base text-muted-foreground font-normal leading-relaxed mb-10">
            Join developers orchestrating LLMs, vector databases, and custom developer tools in sub-10ms latency visual workflows.
          </p>

          <div className="space-y-4">
            <FeatureCheck text="Visual drag-and-drop pipeline builder" />
            <FeatureCheck text="50+ native tool and database connectors" />
            <FeatureCheck text="Zero-code 1-click cloud deployments" />
          </div>
        </div>

      </div>
    </div>
  );
}

function FeatureCheck({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary shrink-0">
        <span className="text-[9px]">✔</span>
      </div>
      <span className="text-xs text-foreground font-medium">{text}</span>
    </div>
  );
}
