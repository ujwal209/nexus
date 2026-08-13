"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // PASSWORD STRENGTH STATE
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("");

  useEffect(() => {
    // Calculate password strength
    if (!password) {
      setStrengthScore(0);
      setStrengthLabel("");
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    setStrengthScore(score);

    switch (score) {
      case 1:
        setStrengthLabel("Weak");
        break;
      case 2:
        setStrengthLabel("Fair");
        break;
      case 3:
        setStrengthLabel("Good");
        break;
      case 4:
        setStrengthLabel("Strong");
        break;
      default:
        setStrengthLabel("Very Weak");
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (strengthScore < 2) {
      setErrorMsg("Please choose a stronger password (fair or better).");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      // Store email temporarily for verify page
      localStorage.setItem("nexus-verify-email", email);
      router.push("/verify-email");
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
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-normal">
          Start building autonomous node-based agent pipelines.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-500 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
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

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">Password</Label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              className="pl-9 pr-10 h-10 bg-card border-border rounded-md text-xs focus-visible:ring-foreground text-foreground shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            >
              {showPassword ? <FiEyeOff className="h-3.5 w-3.5" /> : <FiEye className="h-3.5 w-3.5" />}
            </button>
          </div>
          
          {/* PASSWORD STRENGTH METER */}
          {password && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">Password Strength:</span>
                <span className={`font-semibold ${
                  strengthScore <= 1 ? "text-red-500" :
                  strengthScore === 2 ? "text-amber-500" :
                  strengthScore === 3 ? "text-blue-500" : "text-emerald-500"
                }`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${
                  strengthScore >= 1 ? (strengthScore === 1 ? "bg-red-500" : strengthScore === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-transparent"
                }`} />
                <div className={`h-full rounded-full transition-all duration-300 ${
                  strengthScore >= 2 ? (strengthScore === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-transparent"
                }`} />
                <div className={`h-full rounded-full transition-all duration-300 ${
                  strengthScore >= 3 ? "bg-emerald-500" : "bg-transparent"
                }`} />
                <div className={`h-full rounded-full transition-all duration-300 ${
                  strengthScore >= 4 ? "bg-emerald-500" : "bg-transparent"
                }`} />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-xs font-semibold text-muted-foreground">Confirm Password</Label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              className="pl-9 pr-10 h-10 bg-card border-border rounded-md text-xs focus-visible:ring-foreground text-foreground shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            >
              {showConfirmPassword ? <FiEyeOff className="h-3.5 w-3.5" /> : <FiEye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-md text-xs cursor-pointer shadow-2xs mt-2"
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
