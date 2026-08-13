"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiCpu,
  FiZap,
  FiDatabase,
  FiServer,
  FiTerminal,
  FiMenu,
  FiX,
  FiSearch,
  FiChevronRight,
  FiExternalLink,
  FiFileText,
  FiArrowUpRight,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface NavItem {
  title: string;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  React.useEffect(() => {
    const saved = localStorage.getItem("nexus-theme");
    const currentTheme = saved || "dark";
    setIsDarkMode(currentTheme === "dark");
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    const themeStr = next ? "dark" : "light";
    localStorage.setItem("nexus-theme", themeStr);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const docsNav: NavSection[] = [
    {
      title: "Getting Started",
      icon: <FiZap className="h-3.5 w-3.5 text-primary" />,
      items: [
        { title: "Introduction", href: "/docs" },
        { title: "Quickstart Guide", href: "/docs/quickstart", badge: "Fast" },
        { title: "Core Concepts", href: "/docs/concepts" },
      ],
    },
    {
      title: "Node Reference",
      icon: <FiServer className="h-3.5 w-3.5 text-primary" />,
      items: [
        { title: "LLM Orchestrator", href: "/docs/nodes/llm" },
        { title: "Vector Databases", href: "/docs/nodes/vector", badge: "Popular" },
        { title: "Web Tools & Search", href: "/docs/nodes/tools" },
        { title: "Code Sandboxes", href: "/docs/nodes/code" },
      ],
    },
    {
      title: "API & SDKs",
      icon: <FiTerminal className="h-3.5 w-3.5 text-primary" />,
      items: [
        { title: "REST API Reference", href: "/docs/api/rest" },
        { title: "Python SDK", href: "/docs/api/python" },
        { title: "TypeScript SDK", href: "/docs/api/typescript" },
      ],
    },
    {
      title: "Enterprise",
      icon: <FiDatabase className="h-3.5 w-3.5 text-primary" />,
      items: [
        { title: "VPC Deployment", href: "/docs/enterprise/vpc" },
        { title: "Security & SOC2", href: "/docs/enterprise/security" },
      ],
    },
  ];

  // Helper to format breadcrumb title
  const getBreadcrumbTitle = () => {
    if (pathname === "/docs") return "Introduction";
    const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      
      {/* 1. TOP GLOBAL HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-xl border border-border"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </Button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <FiCpu className="h-5 w-5" />
              </div>
              <span className="font-extrabold tracking-tight text-foreground font-sans flex items-center gap-2 text-base">
                NEXUS <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5 rounded-md">DOCS</Badge>
              </span>
            </Link>

            {/* Breadcrumb Trail (Desktop) */}
            <div className="hidden lg:flex items-center ml-6 border-l border-border/60 pl-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="text-xs text-muted-foreground hover:text-foreground">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/docs" className="text-xs text-muted-foreground hover:text-foreground">Docs</BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathname !== "/docs" && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-xs font-semibold text-foreground">{getBreadcrumbTitle()}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center w-64">
              <FiSearch className="absolute left-3.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search docs... (Ctrl+K)"
                className="pl-9 pr-4 h-9 text-xs bg-muted/40 border-border rounded-xl focus-visible:ring-primary"
              />
            </div>

            <Button asChild variant="outline" size="sm" className="hidden sm:flex border-border rounded-xl font-semibold text-xs gap-1.5 h-9">
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <span>GitHub</span>
                <FiArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer shrink-0 shadow-sm"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <FiSun className="h-4 w-4 text-secondary-foreground" /> : <FiMoon className="h-4 w-4" />}
            </Button>

            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs px-4 h-9 shadow-sm">
              <Link href="/playground">Launch Builder</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN LAYOUT BODY */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* LEFT SIDEBAR (Desktop Sticky) */}
        <aside className="hidden md:block w-64 shrink-0 py-8 pr-6 border-r border-border/60">
          <div className="sticky top-24 space-y-7">
            {docsNav.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground font-mono uppercase tracking-wider px-2">
                  {section.icon}
                  <span>{section.title}</span>
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item, iIdx) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={iIdx}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-xs"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 rounded-md">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER OVERLAY */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-50 bg-background border-b border-border p-6 overflow-y-auto">
            <div className="space-y-8 pb-12">
              {docsNav.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item, iIdx) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={iIdx}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 text-sm rounded-xl font-medium ${
                            isActive ? "bg-primary/10 text-primary font-bold border border-primary/20" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className="text-[10px] font-mono text-primary bg-primary/10">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MIDDLE MAIN CONTENT ARTICLE */}
        <main className="flex-1 py-8 md:py-10 md:px-10 min-w-0">
          {children}
        </main>

        {/* RIGHT SIDEBAR: ON THIS PAGE (Desktop XL Sticky Table of Contents) */}
        <aside className="hidden xl:block w-56 shrink-0 py-8 pl-6 border-l border-border/60">
          <div className="sticky top-24 space-y-4">
            <h4 className="text-xs font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
              <FiFileText className="h-3.5 w-3.5 text-primary" />
              <span>On This Page</span>
            </h4>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <a href="#overview" className="hover:text-primary transition-colors block truncate">
                  Overview & Architecture
                </a>
              </li>
              <li>
                <a href="#quickstart" className="hover:text-primary transition-colors block truncate">
                  Setup & Credentials
                </a>
              </li>
              <li>
                <a href="#examples" className="hover:text-primary transition-colors block truncate">
                  Code Snippets & Usage
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors block truncate">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>

            <div className="pt-6 border-t border-border/60">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                <p className="text-[11px] font-bold text-foreground">Need Help?</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Join our Discord community or submit a GitHub issue for 24/7 assistance.
                </p>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline pt-1"
                >
                  <span>Ask Community</span>
                  <FiExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
