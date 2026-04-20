"use client";

import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { pickAvatarColor } from "@/lib/hash";
import { buildStarterContent, writeStarterContent } from "@/lib/seed";

type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthState {
  currentUserId: string | null;
  currentUserEmail: string | null;
  hydrated: boolean;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  /** Subscribe to Firebase auth state; returns an unsubscribe fn. */
  subscribe: () => () => void;
}

function translateAuthError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Bu email bilan foydalanuvchi allaqachon mavjud";
    case "auth/invalid-email":
      return "Email noto'g'ri";
    case "auth/weak-password":
      return "Parol juda kuchsiz (kamida 6 ta belgi)";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email yoki parol noto'g'ri";
    case "auth/network-request-failed":
      return "Internet aloqasi yo'q";
    case "auth/configuration-not-found":
      return "Firebase Auth hali yoqilmagan. Administrator bilan bog'laning.";
    default:
      return code ? `Xatolik: ${code}` : "Noma'lum xatolik";
  }
}

async function ensureUserDoc(fbUser: FirebaseUser, displayName?: string) {
  const ref = doc(db, "users", fbUser.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;
  const email = fbUser.email ?? "";
  await setDoc(ref, {
    id: fbUser.uid,
    name: displayName?.trim() || fbUser.displayName || email.split("@")[0],
    email,
    avatarColor: pickAvatarColor(email || fbUser.uid),
    createdAt: Date.now(),
  });
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentUserId: null,
  currentUserEmail: null,
  hydrated: false,

  subscribe: () => {
    return onAuthStateChanged(auth, (fbUser) => {
      set({
        currentUserId: fbUser?.uid ?? null,
        currentUserEmail: fbUser?.email ?? null,
        hydrated: true,
      });
    });
  },

  register: async (name, email, password) => {
    const trimmedName = name.trim();
    if (!trimmedName) return { ok: false, error: "Ism kiritilmadi" };
    if (password.length < 6)
      return {
        ok: false,
        error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
      };
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );
      await updateProfile(cred.user, { displayName: trimmedName }).catch(
        () => undefined,
      );
      await ensureUserDoc(cred.user, trimmedName);
      // Seed the new user with a starter workspace + board the first time.
      const starter = buildStarterContent(cred.user.uid);
      await writeStarterContent(starter);
      return { ok: true };
    } catch (e: unknown) {
      const err = e as { code?: string };
      return { ok: false, error: translateAuthError(err.code ?? "") };
    }
  },

  login: async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );
      await ensureUserDoc(cred.user);
      return { ok: true };
    } catch (e: unknown) {
      const err = e as { code?: string };
      return { ok: false, error: translateAuthError(err.code ?? "") };
    }
  },

  logout: async () => {
    await signOut(auth);
  },
}));
