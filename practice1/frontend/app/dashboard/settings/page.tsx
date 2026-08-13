"use client";

import React, { useContext } from "react";
import { motion } from "framer-motion";
import { DashboardContext } from "@/context/DashboardContext";

export default function SettingsPage() {
  const context = useContext(DashboardContext);

  if (!context) {
    return null;
  }

  const { userProfile } = context;

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-sm font-bold text-foreground">Settings & Plan</h2>
        <p className="text-xs text-muted-foreground">Manage your workspace configuration and credit balance details.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg border border-border bg-card space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Profile</h3>
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">
              Email: <strong className="text-foreground font-semibold">{userProfile?.email}</strong>
            </p>
            <p className="text-muted-foreground">
              Role: <strong className="text-foreground font-semibold">{userProfile?.account_type === "startup" ? "Startup Founder" : "Individual Developer"}</strong>
            </p>
            <p className="text-muted-foreground">
              Created: <strong className="text-foreground font-semibold">{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : ""}</strong>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-border bg-card space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Credits & Plan</h3>
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">
              Active Plan: <strong className="text-foreground font-semibold">Free Sandbox Tier</strong>
            </p>
            <p className="text-muted-foreground">
              Credits Balance: <strong className="text-emerald-500 font-bold">${userProfile?.balance?.toFixed(2)}</strong>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
