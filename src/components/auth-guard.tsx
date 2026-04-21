"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !currentUserId) router.replace("/login");
  }, [hydrated, currentUserId, router]);

  if (!hydrated || !currentUserId) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-muted-foreground">
        Yuklanmoqda…
      </div>
    );
  }
  return <>{children}</>;
}
