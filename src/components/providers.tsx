"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { buildStarterContent, writeStarterContent } from "@/lib/seed";

export function Providers({ children }: { children: ReactNode }) {
  const authHydrated = useAuthStore((s) => s.hydrated);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const currentUserEmail = useAuthStore((s) => s.currentUserEmail);
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

  // Subscribe to invitations addressed to the signed-in user's email so the
  // notification bell updates in real time across sessions/devices.
  useEffect(() => {
    if (!currentUserEmail) return;
    const unsub = useDataStore
      .getState()
      .subscribeInvitations(currentUserEmail);
    return () => unsub();
  }, [currentUserEmail]);

  // Self-healing: if the signed-in user has no workspaces after Firestore
  // hydrates, seed a starter workspace + board. This covers the case where
  // the registration-time batch write failed (e.g. rule misconfiguration) and
  // the user would otherwise be stuck with an empty dashboard.
  const seedingAttempted = useRef<string | null>(null);
  useEffect(() => {
    if (!currentUserId || !dataHydrated) return;
    if (seedingAttempted.current === currentUserId) return;
    const workspaces = useDataStore.getState().workspaces;
    if (workspaces.length === 0) {
      seedingAttempted.current = currentUserId;
      writeStarterContent(buildStarterContent(currentUserId)).catch(() => {
        // If the retry itself fails (rules still denying, offline, etc.) leave
        // the dashboard empty rather than spamming retries.
      });
    }
  }, [currentUserId, dataHydrated]);

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
