"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FiGrid,
  FiActivity,
  FiKey,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiLayers,
  FiSun,
  FiMoon,
  FiZap,
  FiBarChart2,
  FiDatabase,
  FiBook,
} from "react-icons/fi";

interface DashboardSidebarProps {
  activeTab: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

const NAV_GROUPS = [
  {
    label: "Automation",
    items: [
      { id: "workflows", label: "Workflows", icon: FiGrid, path: "/dashboard" },
      { id: "executions", label: "Runs & Logs", icon: FiActivity, path: "/dashboard/executions" },
      { id: "templates", label: "Templates", icon: FiLayers, path: "/dashboard/new" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { id: "keys", label: "API Credentials", icon: FiKey, path: "/dashboard/keys" },
      { id: "settings", label: "Settings", icon: FiSettings, path: "/dashboard/settings" },
    ],
  },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  collapsed,
  onToggleCollapse,
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("nexus-theme") || "dark";
    setTheme(saved as "light" | "dark");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("nexus-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleNav = (path: string) => {
    router.push(path);
    if (isMobileDrawer && onCloseMobile) onCloseMobile();
  };

  const handleSignOut = () => {
    localStorage.removeItem("nexus-token");
    localStorage.removeItem("nexus-email");
    router.push("/");
  };

  const isExpanded = isMobileDrawer || !collapsed;

  const isActive = (id: string, path: string) => {
    if (id === "workflows") return pathname === "/dashboard";
    if (id === "templates") return pathname.startsWith("/dashboard/new");
    return pathname.startsWith(path);
  };

  return (
    <aside
      style={{ width: isExpanded ? 240 : 60 }}
      className="h-screen bg-card border-r border-border flex flex-col shrink-0 select-none overflow-hidden transition-[width] duration-300 ease-in-out"
    >
      {/* ── Brand Header ── */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-border shrink-0">
        {isExpanded ? (
          <span className="text-[11px] font-bold tracking-widest text-foreground uppercase">
            Nexus <span className="text-primary font-normal opacity-70">Studio</span>
          </span>
        ) : (
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs mx-auto">
            N
          </div>
        )}

        {/* Desktop collapse / Mobile close */}
        {isMobileDrawer ? (
          <button
            onClick={onCloseMobile}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted/80 transition-colors"
          >
            <FiX className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted/80 transition-colors hidden md:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <FiChevronRight className="h-3.5 w-3.5" />
            ) : (
              <FiChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* ── Navigation Groups ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {/* Group label — only when expanded */}
            {isExpanded && (
              <p className="px-2 pb-1 text-[9px] uppercase tracking-widest font-bold text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.id, item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.path)}
                    title={!isExpanded ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 rounded-md transition-all duration-150 cursor-pointer text-xs font-medium
                      ${isExpanded ? "px-2.5 py-2" : "px-0 py-2.5 justify-center"}
                      ${
                        active
                          ? "bg-primary/8 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }
                    `}
                  >
                    <item.icon
                      className={`shrink-0 ${isExpanded ? "w-3.5 h-3.5" : "w-4 h-4"} ${
                        active ? "text-primary" : ""
                      }`}
                    />
                    {isExpanded && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-2 pb-3 pt-2 border-t border-border space-y-0.5 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={`w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer transition-colors
            ${!isExpanded ? "justify-center px-0" : ""}
          `}
        >
          {theme === "dark" ? (
            <FiSun className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          ) : (
            <FiMoon className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
          )}
          {isExpanded && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-red-500/80 hover:text-red-500 hover:bg-red-500/8 cursor-pointer transition-colors
            ${!isExpanded ? "justify-center px-0" : ""}
          `}
        >
          <FiLogOut className="w-3.5 h-3.5 shrink-0" />
          {isExpanded && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
