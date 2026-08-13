"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiCheckCircle, FiChevronRight, FiChevronLeft } from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function OnboardingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // WIZARD STEPS: 1, 2, 3, or 4 (Celebration)
  const [wizardStep, setWizardStep] = useState(1);

  // ONBOARDING DATA FIELDS
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  useEffect(() => {
    const savedToken = localStorage.getItem("nexus-token");
    if (!savedToken) {
      router.push("/login");
      return;
    }
    setToken(savedToken);

    // Verify current status
    const verifyUserStatus = async () => {
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

        if (data.onboarded) {
          router.push("/dashboard");
        }
      } catch (err) {
        localStorage.removeItem("nexus-token");
        localStorage.removeItem("nexus-email");
        router.push("/login");
      }
    };

    verifyUserStatus();
  }, [router]);

  const handleNext = () => {
    if (wizardStep === 1) {
      if (!workspaceName.trim()) {
        setErrorMsg("Please enter a workspace name.");
        return;
      }
      if (!selectedRole) {
        setErrorMsg("Please select your professional role.");
        return;
      }
    }
    if (wizardStep === 2 && selectedGoals.length === 0) {
      setErrorMsg("Please select at least one pipeline goal.");
      return;
    }
    if (wizardStep === 3 && selectedTech.length === 0) {
      setErrorMsg("Please select at least one tech stack tool.");
      return;
    }

    setErrorMsg("");
    setWizardStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    setWizardStep((prev) => Math.max(1, prev - 1));
  };

  const toggleGoal = (goal: string) => {
    setErrorMsg("");
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleTech = (tech: string) => {
    setErrorMsg("");
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          account_type: selectedRole === "Startup Founder" ? "startup" : "individual",
          workspace_name: workspaceName,
          role: selectedRole,
          goals: selectedGoals,
          tech_stack: selectedTech
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Onboarding failed");
      }

      setWizardStep(4); // Celebration step
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Grid lines background */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

      <div className="absolute top-8 left-8">
        <span className="text-sm font-extrabold tracking-tight text-foreground">
          NEXUS <span className="text-primary font-light">STUDIO</span>
        </span>
      </div>

      <div className="w-full max-w-xl mx-auto z-10">
        
        {/* Step Progress Indicators */}
        {wizardStep < 4 && (
          <div className="w-full max-w-xl mx-auto mb-10">
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: "Workspace", desc: "Profile details" },
                { step: 2, label: "Goals", desc: "Pipeline focus" },
                { step: 3, label: "Stack", desc: "Tech integrations" }
              ].map((item, idx) => {
                const isActive = wizardStep === item.step;
                const isCompleted = wizardStep > item.step;
                return (
                  <React.Fragment key={item.step}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg border text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                            : isCompleted
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                            : "border-border bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? "✓" : item.step}
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className={`text-xs font-bold leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {item.label}
                        </div>
                        <div className="text-[9px] text-muted-foreground/80 leading-none mt-0.5 whitespace-nowrap">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    {idx < 2 && (
                      <div
                        className={`h-0.5 flex-1 mx-4 rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-emerald-500" : "bg-border"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: ROLE & WORKSPACE */}
          {wizardStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 bg-card border border-border p-6 sm:p-8 rounded-lg shadow-sm"
            >
              <div className="space-y-1.5 text-center">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Personalize Workspace
                </h2>
                <p className="text-xs text-muted-foreground">
                  Name your development node and choose your primary role.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-500 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                {/* Workspace Name Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="workspace" className="text-xs font-semibold text-muted-foreground">Workspace Name</Label>
                  <Input
                    id="workspace"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                    placeholder="e.g. core-agent-service"
                    className="h-10 text-xs bg-background border-border rounded-md text-foreground focus-visible:ring-foreground"
                  />
                </div>

                {/* Roles Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground block">Your Role</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "Developer", label: "Developer", desc: "Builds workflows" },
                      { id: "Startup Founder", label: "Founder", desc: "Launches solutions" },
                      { id: "Product Manager", label: "Manager", desc: "Manages agents" },
                      { id: "AI Researcher", label: "Researcher", desc: "Explores models" }
                    ].map((role) => {
                      const isSelected = selectedRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.id);
                            setErrorMsg("");
                          }}
                          className={`flex flex-col items-start p-3 rounded-md border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-muted/80 border-foreground text-foreground"
                              : "bg-background border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="font-bold text-xs text-foreground block">{role.label}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">{role.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-md text-xs cursor-pointer shadow-2xs mt-2 flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <FiChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: PIPELINE GOALS */}
          {wizardStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 bg-card border border-border p-6 sm:p-8 rounded-lg shadow-sm"
            >
              <div className="space-y-1.5 text-center">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Select Workflow Goals
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose the pipeline goals you are looking to orchestrate (select all that apply).
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-500 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "pipelines", label: "Visual Pipelines & ETL", desc: "Design visual chains of nodes & variables" },
                  { id: "support", label: "Support & Messaging Bots", desc: "Automate Slack, Discord, and email tasks" },
                  { id: "swarms", label: "Agent Swarms & Teams", desc: "Supervisor-worker autonomous networks" },
                  { id: "api", label: "External REST APIs", desc: "Trigger calls using webhooks & HTTP actions" }
                ].map((goal) => {
                  const isChecked = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-md border text-left cursor-pointer transition-all ${
                        isChecked
                          ? "bg-muted/80 border-foreground text-foreground"
                          : "bg-background border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked ? "bg-foreground border-foreground text-background" : "border-border bg-background"
                      }`}>
                        {isChecked && <span className="text-[10px]">✓</span>}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-foreground block leading-tight">{goal.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-normal mt-0.5 block">{goal.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="h-10 px-4 border-border hover:bg-muted text-xs font-semibold rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <FiChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 h-10 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-md text-xs cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <FiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PREFERRED MODELS */}
          {wizardStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 bg-card border border-border p-6 sm:p-8 rounded-lg shadow-sm"
            >
              <div className="space-y-1.5 text-center">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Select Model Stack
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select the engines and databases you plan to connect (select all that apply).
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-500 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "openai", label: "OpenAI GPT Models", desc: "Omni GPT-4o, GPT-4o-mini & reasoning o3-mini" },
                  { id: "anthropic", label: "Anthropic Claude", desc: "Claude 3.7 Hybrid Reasoning & 3.5 Sonnet" },
                  { id: "gemini_deepseek", label: "Gemini & DeepSeek", desc: "DeepSeek R1 / V3 and Google Gemini 2.0 Flash" },
                  { id: "databases", label: "Vector DBs & SQL", desc: "Pinecone, PostgreSQL, Supabase, and MongoDB" }
                ].map((tech) => {
                  const isChecked = selectedTech.includes(tech.id);
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => toggleTech(tech.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-md border text-left cursor-pointer transition-all ${
                        isChecked
                          ? "bg-muted/80 border-foreground text-foreground"
                          : "bg-background border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked ? "bg-foreground border-foreground text-background" : "border-border bg-background"
                      }`}>
                        {isChecked && <span className="text-[10px]">✓</span>}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-foreground block leading-tight">{tech.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-normal mt-0.5 block">{tech.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="h-10 px-4 border-border hover:bg-muted text-xs font-semibold rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <FiChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading}
                  className="flex-1 h-10 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-md text-xs cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>{isLoading ? "Setting up..." : "Complete Setup"}</span>
                  <FiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CELEBRATION */}
          {wizardStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-6 max-w-md mx-auto bg-card border border-border p-8 rounded-lg shadow-sm"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 text-2xl mx-auto animate-pulse">
                ✓
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Workspace `{workspaceName}` Ready!
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  We have successfully built your environment and credited your profile with <strong className="text-emerald-500">$100.00</strong> free server-run credit.
                </p>
              </div>

              <div className="h-px bg-border w-full my-4" />

              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-md text-xs cursor-pointer shadow-2xs"
              >
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
