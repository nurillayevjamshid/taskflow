"use client";

import { ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";

export function Providers({ children }: { children: ReactNode }) {
  const authHydrated = useAuthStore((s) => s.hydrated);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const dataHydrated = useDataStore((s) => s.hydrated);

  // Subscribe to Firebase auth state once on mount.
  useEffect(() => {
    const unsub = useAuthStore.getState().subscribe();
    return () => unsub();
  }, []);

  // Apply theme from localStorage on first paint.
  useEffect(() => {
    const stored = localStorage.getItem("taskly:theme");
    const dark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  // When the signed-in user changes, (re)subscribe to their global Firestore
  // data. When they sign out, wipe the local cache.
  useEffect(() => {
    if (!currentUserId) {
      useDataStore.getState().clear();
      return;
    }
    const unsub = useDataStore.getState().subscribeGlobal(currentUserId);
    return () => {
      unsub();
    };
  }, [currentUserId]);

  // Keep a visible shell while Firebase auth is figuring out the session.
  // Unauthenticated pages (landing/login/register) don't need `dataHydrated`.
  if (!authHydrated) {
    return (
      <div
        className="min-h-screen w-full bg-background"
        aria-hidden="true"
      />
    );
  }

  // If the user is signed in but data hasn't hydrated yet, render a subtle
  // skeleton so downstream components don't flash empty lists.
  if (currentUserId && !dataHydrated) {
    return (
      <TooltipProvider delay={200}>
        <div className="min-h-screen w-full bg-background" aria-hidden="true" />
        <Toaster richColors position="top-right" closeButton />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delay={200}>
      {children}
      <Toaster richColors position="top-right" closeButton />
    </TooltipProvider>
  );
}
