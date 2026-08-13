"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardContext } from "@/context/DashboardContext";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { fetchWorkflowsFromBackend, fetchExecutionsFromBackend } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTab] = useState<"workflows" | "executions" | "keys" | "settings" | "templates">("workflows");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [credentials, setCredentials] = useState<{ [key: string]: string }>({});
  const [authLoading, setAuthLoading] = useState(true);
  
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(false);

  // Sync activeTab based on current pathname route
  useEffect(() => {
    if (pathname.startsWith("/dashboard/executions")) {
      setActiveTab("executions");
    } else if (pathname.startsWith("/dashboard/keys")) {
      setActiveTab("keys");
    } else if (pathname.startsWith("/dashboard/settings")) {
      setActiveTab("settings");
    } else if (pathname.startsWith("/dashboard/new")) {
      setActiveTab("templates");
    } else {
      setActiveTab("workflows");
    }
  }, [pathname]);

  const fetchWorkflows = async (savedToken: string) => {
    try {
      const wfData = await fetchWorkflowsFromBackend();
      if (wfData && wfData.workflows) {
        setWorkflows(wfData.workflows);
      }
    } catch (err) {
      console.error("Failed to load workflows:", err);
    }
  };

  const fetchExecutions = async () => {
    setIsLoadingExecutions(true);
    try {
      const data = await fetchExecutionsFromBackend();
      if (data && data.executions) {
        setExecutions(data.executions);
      }
    } catch (err) {
      console.error("Failed to load executions:", err);
    } finally {
      setIsLoadingExecutions(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("nexus-token");
    if (!savedToken) {
      router.push("/login");
      return;
    }
    setToken(savedToken);

    const checkAuthStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { "Authorization": `Bearer ${savedToken}` }
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();

        if (!data.is_verified) {
          localStorage.setItem("nexus-verify-email", data.email);
          router.push("/verify-email");
          return;
        }

        if (!data.onboarded) {
          router.push("/onboarding");
          return;
        }

        setUserProfile(data);
        setCredentials(data.api_credentials || {});
        setAuthLoading(false);

        // Prefetch data
        await fetchWorkflows(savedToken);
        await fetchExecutions();
      } catch (err) {
        localStorage.removeItem("nexus-token");
        localStorage.removeItem("nexus-email");
        router.push("/login");
      }
    };

    checkAuthStatus();
  }, [router]);

  // Canvas editor pages are full-screen and carry their own embedded sidebar.
  // Pass through children directly so we don't double-wrap with the shared layout.
  const isCanvasPage = pathname.startsWith("/dashboard/workflow/");

  if (isCanvasPage) {
    return <>{children}</>;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="flex flex-col items-center gap-3">
          <span className="text-lg font-extrabold tracking-tight text-foreground select-none">
            NEXUS <span className="text-primary font-light">STUDIO</span>
          </span>
          <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground animate-pulse">
            Establishing secure user session...
          </div>
        </div>
      </div>
    );
  }

  // Set page title based on active route
  const titleMap: Record<string, string> = {
    executions: "Runs & Logs",
    keys: "API Credentials",
    settings: "Account Settings",
    templates: "Template Library",
  };
  const title = titleMap[activeTab] ?? "Workflows Manager";

  return (
    <DashboardContext.Provider value={{
      userProfile,
      setUserProfile,
      credentials,
      setCredentials,
      workflows,
      setWorkflows,
      fetchWorkflows,
      executions,
      setExecutions,
      fetchExecutions,
      isLoadingExecutions,
      token,
      API_BASE_URL
    }}>
      <div className="min-h-screen w-full bg-background text-foreground flex font-sans overflow-hidden relative">
        
        {/* 1. DESKTOP SIDEBAR (hidden on mobile) */}
        <div className="hidden md:flex">
          <DashboardSidebar
            activeTab={activeTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* 2. MOBILE DRAWER SIDEBAR (collapsible overlay drawer) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden cursor-pointer"
              />
              
              {/* Sliding drawer container */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed inset-y-0 left-0 z-50 md:hidden shadow-xl"
              >
                <DashboardSidebar
                  activeTab={activeTab}
                  collapsed={false}
                  onToggleCollapse={() => {}}
                  isMobileDrawer={true}
                  onCloseMobile={() => setMobileMenuOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 3. MAIN WORKSPACE CONTAINER */}
        <main className="flex-1 h-screen overflow-y-auto bg-background relative flex flex-col justify-start w-full">
          <header className="h-16 border-b border-border bg-card/45 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-3">
              {/* Hamburger menu button for mobile only */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted md:hidden cursor-pointer"
                title="Open Menu"
              >
                <FiMenu className="h-4.5 w-4.5" />
              </button>
              <h1 className="text-sm sm:text-base font-bold text-foreground capitalize truncate max-w-[150px] sm:max-w-none">
                {title}
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="border border-border bg-card/60 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-mono font-medium text-muted-foreground hidden xs:inline">Credit:</span>
                <span className="text-xs font-bold text-emerald-500">${userProfile?.balance?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="text-xs font-medium text-muted-foreground truncate hidden lg:block max-w-[180px]">
                {userProfile?.email}
              </div>
            </div>
          </header>

          {/* Tab content panel */}
          <div className={`p-4 sm:p-6 w-full mx-auto space-y-6 transition-all duration-300 ${
            ["executions", "workflows"].includes(activeTab) ? "max-w-6xl" : "max-w-4xl"
          }`}>
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
