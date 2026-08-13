"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowRight, FiMenu, FiX, FiSun, FiMoon, FiChevronDown, FiBookOpen } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Mobile menu accordion toggles
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nexus-theme");
    const currentTheme = saved || "dark";
    setIsDarkMode(currentTheme === "dark");
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("nexus-token"));
      setUserEmail(localStorage.getItem("nexus-email"));
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

  const handleSignOut = () => {
    localStorage.removeItem("nexus-token");
    localStorage.removeItem("nexus-email");
    setToken(null);
    setUserEmail(null);
    window.location.reload();
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md transition-colors"
    >
      <div className="mx-auto flex min-h-[64px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5">
        
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90 shrink-0">
          <span className="text-xl font-extrabold tracking-tight text-foreground font-sans flex items-center gap-2">
            NEXUS <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">STUDIO</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION & MEGAMENUS */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {/* Product Megamenu */}
          <div className="relative group py-4">
            <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <span>Products</span>
              <FiChevronDown className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-200" />
            </button>
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[460px] bg-card border border-border rounded-2xl shadow-xl p-5 hidden group-hover:block z-50">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/playground" className="flex flex-col p-3 rounded-xl hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-foreground">Visual Canvas</span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 leading-normal">Drag-and-drop workflow designer studio.</span>
                </Link>
                <Link href="/playground" className="flex flex-col p-3 rounded-xl hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-foreground">Custom Scripts</span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 leading-normal">Run safe Python and Node sandbox VM tasks.</span>
                </Link>
                <Link href="/playground" className="flex flex-col p-3 rounded-xl hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-foreground">Supervisor Mode</span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 leading-normal">Form autonomous supervisor agent networks.</span>
                </Link>
                <Link href="/playground" className="flex flex-col p-3 rounded-xl hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-foreground">API Endpoints</span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 leading-normal">Deploy graphs as serverless edge routes.</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Resources Megamenu */}
          <div className="relative group py-4">
            <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <span>Resources</span>
              <FiChevronDown className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-200" />
            </button>
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[460px] bg-card border border-border rounded-2xl shadow-xl p-5 hidden group-hover:block z-50">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/docs" className="flex flex-col p-3 rounded-xl hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-foreground">System Docs</span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 leading-normal">First-class reference and guides library.</span>
                </Link>
                <Link href="/#templates" className="flex flex-col p-3 rounded-xl hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-foreground">Agent Blueprints</span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 leading-normal">Download pre-built workflow templates.</span>
                </Link>
                <Link href="/docs/api/rest" className="flex flex-col p-3 rounded-xl hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-foreground">REST API Spec</span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 leading-normal">Audit execution latency and variables.</span>
                </Link>
                <Link href="/docs/enterprise/vpc" className="flex flex-col p-3 rounded-xl hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-foreground">Enterprise VPC</span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 leading-normal">Deploy securely inside private clouds.</span>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/docs" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Developers
          </Link>

          <Link href="/#pricing" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>

        {/* AUTH CONTROLS & ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer shrink-0 shadow-sm"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <FiSun className="h-4 w-4 text-secondary-foreground" /> : <FiMoon className="h-4 w-4" />}
          </Button>

          {token ? (
            <>
              <Button
                variant="ghost"
                asChild
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer rounded-xl h-10"
              >
                <Link href="/playground">Try Canvas</Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer rounded-xl h-10"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                onClick={handleSignOut}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer whitespace-nowrap h-10 border border-primary/20"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer rounded-xl h-10"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer whitespace-nowrap h-10 border border-primary/20"
              >
                <Link href="/signup" className="gap-2 flex items-center">
                  <span>Start Free</span>
                  <FiArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* MOBILE ACTIONS */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-border bg-card text-muted-foreground shrink-0 shadow-sm"
          >
            {isDarkMode ? <FiSun className="h-4 w-4 text-secondary-foreground" /> : <FiMoon className="h-4 w-4" />}
          </Button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border bg-card px-4 py-6 space-y-4 overflow-hidden"
          >
            {/* Products Accordion */}
            <div className="space-y-1">
              <button 
                onClick={() => setMobileProductOpen(!mobileProductOpen)}
                className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-2 cursor-pointer"
              >
                <span>Products</span>
                <FiChevronDown className={`h-4 w-4 transition-transform ${mobileProductOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileProductOpen && (
                <div className="pl-3 border-l border-border mt-1 space-y-2">
                  <Link href="/playground" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-muted-foreground py-1.5 hover:text-primary">Visual Canvas</Link>
                  <Link href="/playground" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-muted-foreground py-1.5 hover:text-primary">Custom Scripts</Link>
                  <Link href="/playground" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-muted-foreground py-1.5 hover:text-primary">Supervisor Mode</Link>
                  <Link href="/playground" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-muted-foreground py-1.5 hover:text-primary">API Endpoints</Link>
                </div>
              )}
            </div>

            {/* Resources Accordion */}
            <div className="space-y-1">
              <button 
                onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-2 cursor-pointer"
              >
                <span>Resources</span>
                <FiChevronDown className={`h-4 w-4 transition-transform ${mobileResourcesOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileResourcesOpen && (
                <div className="pl-3 border-l border-border mt-1 space-y-2">
                  <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-muted-foreground py-1.5 hover:text-primary">System Docs</Link>
                  <Link href="/#templates" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-muted-foreground py-1.5 hover:text-primary">Agent Blueprints</Link>
                  <Link href="/docs/api/rest" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-muted-foreground py-1.5 hover:text-primary">REST API Spec</Link>
                  <Link href="/docs/enterprise/vpc" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-muted-foreground py-1.5 hover:text-primary">Enterprise VPC</Link>
                </div>
              )}
            </div>

            <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-foreground py-2 hover:text-primary">Developers</Link>
            <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-foreground py-2 hover:text-primary">Pricing</Link>
            
            <div className="pt-4 flex flex-col gap-2 border-t border-border/60">
              {token ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-xs font-bold py-3 rounded-xl min-h-[44px]"
                  >
                    <Link href="/playground" onClick={() => setMobileMenuOpen(false)}>Try Canvas</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-xs font-bold py-3 rounded-xl min-h-[44px]"
                  >
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  </Button>
                  <Button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="w-full bg-primary text-primary-foreground text-xs font-bold py-3 rounded-xl shadow-sm min-h-[44px]"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-xs font-bold py-3 rounded-xl min-h-[44px]"
                  >
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-primary text-primary-foreground text-xs font-bold py-3 rounded-xl shadow-sm min-h-[44px]"
                  >
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="gap-2 flex items-center justify-center">
                      <span>Start Free</span>
                      <FiArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
