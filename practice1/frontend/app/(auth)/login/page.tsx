"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If email not verified, backend returns 403. Redirect to verify-email.
        if (res.status === 403) {
          localStorage.setItem("nexus-verify-email", email);
          router.push("/verify-email");
          return;
        }
        throw new Error(data.detail || "Authentication failed");
      }

      // Save token & email
      localStorage.setItem("nexus-token", data.token);
      localStorage.setItem("nexus-email", data.email);

      // Route based on onboarding status
      if (data.onboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full font-sans"
    >
      <div className="text-center sm:text-left mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
          Sign In
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-normal">
          Access your workspaces and resume pipeline orchestration.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-500 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Email Address</Label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="pl-9 h-10 bg-card border-border rounded-md text-xs focus-visible:ring-foreground text-foreground shadow-2xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">Password</Label>
            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="pl-9 h-10 bg-card border-border rounded-md text-xs focus-visible:ring-foreground text-foreground shadow-2xs"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-md text-xs cursor-pointer shadow-2xs mt-2"
        >
          {isLoading ? "Signing in..." : "Continue"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
