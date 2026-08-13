"use client";

import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const PricingSection: React.FC = () => {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: "Developer",
      price: "$0",
      period: "forever free",
      description: "Ideal for individual builders prototyping AI agent workflows.",
      features: [
        "Up to 3 Active Agent Graphs",
        "1,000 Node Executions / mo",
        "OpenAI & Claude LLM Connectors",
        "Community Support",
        "Standard Speed Execution",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro Studio",
      price: annualBilling ? "$29" : "$39",
      period: "per month",
      description: "For engineering teams building production agent pipelines.",
      features: [
        "Unlimited Agent Graphs",
        "50,000 Node Executions / mo",
        "50+ Tool & Database Connectors",
        "Sub-10ms Stream Orchestrator",
        "Multi-Agent Supervisor Teams",
        "1-Click REST API Cloud Hosting",
        "Priority 24/7 Support",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "dedicated cluster",
      description: "For organizations requiring VPC deployment & strict compliance.",
      features: [
        "Custom Execution Quotas",
        "VPC & On-Prem Deployment",
        "SOC2 & HIPAA Compliance",
        "Dedicated LLM Router Instances",
        "Custom Vector DB Integrations",
        "Dedicated Account Engineer",
      ],
      cta: "Contact Enterprise",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-background relative border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 max-w-2xl mx-auto mb-20"
        >
          <Badge variant="outline" className="text-xs font-mono font-semibold text-primary uppercase tracking-widest px-3.5 py-1.5 bg-primary/10 border-primary/20 rounded-full">
            TRANSPARENT PRICING
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight font-sans">
            Simple Plans for Every Builder
          </h2>
          <p className="text-base text-muted-foreground font-medium">
            Start building for free. Scale seamlessly as your workflow execution traffic grows.
          </p>

          {/* BILLING TOGGLE */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className={`text-sm font-semibold ${!annualBilling ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-primary shadow-sm transition duration-200 ease-in-out ${
                  annualBilling ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-2 ${annualBilling ? "text-foreground" : "text-muted-foreground"}`}>
              Annual <Badge variant="outline" className="text-[10px] font-mono text-accent bg-accent/10 border-accent/20 rounded-md px-2 py-0.5">SAVE 20%</Badge>
            </span>
          </div>
        </motion.div>

        {/* PRICING CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pb-10">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="flex"
            >
              <Card
                className={`relative flex flex-col justify-between rounded-2xl border p-8 transition-all w-full min-h-[500px] h-auto ${
                  plan.popular
                    ? "border-primary/50 bg-card shadow-xl shadow-primary/5 z-10 scale-105"
                    : "border-border bg-card shadow-sm hover:shadow-md hover:border-border/80"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 text-[10px] font-bold font-mono text-primary-foreground tracking-widest uppercase rounded-full shadow-sm whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-foreground font-sans mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-sans">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-8 bg-muted/30 rounded-xl p-4 border border-border/50">
                    <span className="text-4xl sm:text-5xl font-extrabold text-foreground font-sans">{plan.price}</span>
                    <span className="text-sm font-mono font-medium text-muted-foreground">/{plan.period}</span>
                  </div>

                  <div className="space-y-4 border-t border-border/50 pt-8">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 text-sm text-foreground font-sans">
                        <FiCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-auto pt-4">
                  <Button
                    asChild
                    className={`w-full py-4 px-6 rounded-xl text-sm font-semibold min-h-[50px] cursor-pointer shadow-sm ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                    }`}
                  >
                    <a href="#canvas-demo" className="flex items-center justify-center text-center">
                      {plan.cta}
                    </a>
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
