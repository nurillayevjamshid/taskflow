"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// These values are public by design (Firebase web SDK config). Access control
// is enforced server-side via Firestore security rules.
const firebaseConfig = {
  apiKey: "AIzaSyDMws41fsAYoeE7_QMkMKrJfsAPT4HmItg",
  authDomain: "taskly-web-8379.firebaseapp.com",
  projectId: "taskly-web-8379",
  storageBucket: "taskly-web-8379.firebasestorage.app",
  messagingSenderId: "642945737298",
  appId: "1:642945737298:web:1782da4e62f1c4d2a8358b",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Persist auth state to localStorage so reloads keep the user signed in.
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Non-fatal: auth still works in memory for the session.
  });

  // Enable offline persistence so the app works without internet.
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn("Firebase persistence: multiple tabs open");
    } else if (err.code === "unimplemented") {
      // The browser doesn't support IndexedDB.
      console.warn("Firebase persistence: browser not supported");
    }
  });
}
