"use client";

import React, { useContext } from "react";
import { DashboardContext } from "@/context/DashboardContext";
import { ExecutionsLogsTab } from "@/components/dashboard/ExecutionsLogsTab";

export default function ExecutionsPage() {
  const context = useContext(DashboardContext);

  if (!context) {
    return null;
  }

  const { executions, workflows, isLoadingExecutions, fetchExecutions } = context;

  return (
    <ExecutionsLogsTab
      executions={executions}
      workflows={workflows}
      isLoadingExecutions={isLoadingExecutions}
      fetchExecutions={fetchExecutions}
    />
  );
}
