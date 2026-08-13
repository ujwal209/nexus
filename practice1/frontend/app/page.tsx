"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroInteractiveCanvas } from "@/components/landing/HeroInteractiveCanvas";
import { TechStackShowcase } from "@/components/landing/TechStackShowcase";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TemplateShowcase } from "@/components/landing/TemplateShowcase";
import { PricingSection } from "@/components/landing/PricingSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative selection:bg-primary selection:text-primary-foreground">
      {/* Sticky Header Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Live Interactive Node Builder Sandbox */}
        <section id="canvas-demo">
          <HeroInteractiveCanvas />
        </section>

        {/* Real TechStack Tools Showcase & Metrics Bar */}
        <TechStackShowcase />

        {/* Enterprise Feature Capabilities */}
        <FeatureGrid />

        {/* Ready Pre-built Templates */}
        <TemplateShowcase />

        {/* Pricing & Plans */}
        <PricingSection />
      </main>

      {/* Corporate Footer */}
      <LandingFooter />
    </div>
  );
}
