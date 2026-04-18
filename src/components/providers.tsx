"use client";

import { ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";

export function Providers({ children }: { children: ReactNode }) {
  const hydrateData = useDataStore((s) => s.hydrated);
  const hydrateAuth = useAuthStore((s) => s.hydrated);
  const seed = useDataStore((s) => s.seed);

  useEffect(() => {
    if (hydrateData) seed();
  }, [hydrateData, seed]);

  useEffect(() => {
    // Apply theme from localStorage on first paint
    const stored = localStorage.getItem("taskflow:theme");
    const dark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  // Brief hydration guard to avoid flashes
  if (!hydrateData || !hydrateAuth) {
    return (
      <div className="min-h-screen w-full bg-background" aria-hidden="true" />
    );
  }

  return (
    <TooltipProvider delay={200}>
      {children}
      <Toaster richColors position="top-right" closeButton />
    </TooltipProvider>
  );
}
