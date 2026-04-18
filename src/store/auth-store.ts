"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";
import { hashPassword, makeId, pickAvatarColor } from "@/lib/hash";
import { SESSION_KEY } from "@/lib/storage";
import { useDataStore } from "./data-store";

type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthState {
  currentUserId: string | null;
  hydrated: boolean;
  markHydrated: () => void;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUserId: null,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      register: async (name, email, password) => {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        if (!trimmedName) return { ok: false, error: "Ism kiritilmadi" };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
          return { ok: false, error: "Email noto'g'ri" };
        if (password.length < 6)
          return {
            ok: false,
            error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
          };

        const data = useDataStore.getState();
        if (data.users.some((u) => u.email.toLowerCase() === trimmedEmail))
          return {
            ok: false,
            error: "Bu email bilan foydalanuvchi allaqachon mavjud",
          };

        const passwordHash = await hashPassword(password);
        const user: User = {
          id: "u_" + makeId(),
          name: trimmedName,
          email: trimmedEmail,
          passwordHash,
          avatarColor: pickAvatarColor(trimmedEmail),
          createdAt: Date.now(),
        };
        data.addUser(user);
        data.ensureStarterContent(user.id);
        set({ currentUserId: user.id });
        return { ok: true };
      },
      login: async (email, password) => {
        const trimmedEmail = email.trim().toLowerCase();
        const data = useDataStore.getState();
        const user = data.users.find(
          (u) => u.email.toLowerCase() === trimmedEmail,
        );
        if (!user)
          return { ok: false, error: "Bunday foydalanuvchi topilmadi" };
        const passwordHash = await hashPassword(password);
        if (!user.passwordHash || user.passwordHash !== passwordHash)
          return { ok: false, error: "Email yoki parol noto'g'ri" };
        set({ currentUserId: user.id });
        return { ok: true };
      },
      logout: () => set({ currentUserId: null }),
    }),
    {
      name: SESSION_KEY,
      partialize: (s) => ({ currentUserId: s.currentUserId }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
