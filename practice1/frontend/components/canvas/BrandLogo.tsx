"use client";

import React, { useState } from "react";

interface BrandLogoProps {
  url: string;
  name: string;
}

export function BrandLogo({ url, name }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (hasError || !url) {
    return (
      <div className="w-full h-full rounded bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground border border-border">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      onError={() => setHasError(true)}
      className="w-full h-full object-contain pointer-events-none"
    />
  );
}
