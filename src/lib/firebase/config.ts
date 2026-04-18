import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  memoryLocalCache,
  type Firestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized already (Next.js hot reload safe)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use single-tab persistent cache (browser) to fix "Another write batch/compaction is already active"
// error that occurs with Next.js Turbopack hot reload. Fall back to memory cache on SSR (no IndexedDB).
let db: Firestore;
try {
  const isBrowser = typeof window !== "undefined";
  db = initializeFirestore(app, {
    localCache: isBrowser
      ? persistentLocalCache({ tabManager: persistentSingleTabManager(undefined) })
      : memoryLocalCache(),
  });
} catch {
  // Already initialized (e.g. hot module reload) — reuse existing instance
  db = getFirestore(app);
}

const storage = getStorage(app);
const functions = getFunctions(app, "us-central1");

export { app, auth, db, storage, functions };
