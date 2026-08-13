"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("nexus-verify-email");
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setErrorMsg("No registration email found. Please register or log in again.");
    }

    // If token exists, check if user is already verified
    const token = localStorage.getItem("nexus-token");
    if (token) {
      const checkStatus = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.is_verified) {
              if (data.onboarded) {
                router.push("/dashboard");
              } else {
                router.push("/onboarding");
              }
            }
          }
        } catch {}
      };
      checkStatus();
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Email address is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Verification failed");
      }

      // Save token & email
      localStorage.setItem("nexus-token", data.token);
      localStorage.setItem("nexus-email", data.email);
      localStorage.removeItem("nexus-verify-email"); // clean up

      setSuccessMsg("Email verified successfully! Redirecting...");
      setTimeout(() => {
        if (data.onboarded) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to resend code");
      }

      setSuccessMsg("A new verification code has been sent to your email.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
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
          Verify Email
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-normal">
          Enter the 6-digit OTP code sent to <strong className="text-foreground">{email || "your email"}</strong>.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-500 font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-500 font-medium flex items-center gap-2">
          <FiCheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="code" className="text-xs font-semibold text-muted-foreground">Verification Code</Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            required
            disabled={!email}
            className="h-10 text-center tracking-[0.5em] font-mono text-base bg-card border-border rounded-md focus-visible:ring-foreground text-foreground shadow-2xs"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-md text-xs cursor-pointer shadow-2xs mt-2"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || !email}
          className="flex items-center gap-1.5 text-primary font-semibold hover:underline cursor-pointer disabled:opacity-40"
        >
          <FiRefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
          <span>{isResending ? "Resending..." : "Resend Code"}</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
        >
          Back to registration
        </button>
      </div>
    </motion.div>
  );
}
