import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect,
  getRedirectResult, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDoc,
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";
import type { NewsStory } from "../types";

// Firebase client configuration (reads from Vite env vars with safe fallbacks)
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyBB0gdCAOzaFHBddadJY8Bt5qX9lTqnn8o",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "thepaperback-india.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "thepaperback-india",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "thepaperback-india.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "150106196223",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:150106196223:web:f0b43d22482a10f71ce4ca"
};

// Initialize Firebase singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

const googleProvider = new GoogleAuthProvider();

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  // Redirect is more reliable than popup on Cloud Run / cross-origin hosts.
  await signInWithRedirect(auth, googleProvider);
  // Page navigates away; callers should not expect a returned user here.
  throw new Error("Redirecting to Google sign-in...");
}

/** Complete Google redirect sign-in after return. Call once on app load. */
export async function completeGoogleRedirect(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
}

/** Format Firebase Auth errors for UI (code + message). */
export function formatAuthError(err: unknown): string {
  const e = err as { code?: string; message?: string };
  const code = e?.code ? String(e.code) : "";
  let message = e?.message ? String(e.message) : "Authentication failed.";
  message = message.replace(/^Firebase:\s*/i, "").replace(/\s*\([^\)]*\)\.?\s*$/, "").trim();
  if (code && message) return code + ": " + message;
  if (code) return code;
  return message || "Authentication failed.";
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function loginAnonymously(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
// User-Isolated Firestore Document Storage Helpers
// Governed by firestore.rules: match /users/{userId}/bookmarks/{bookmarkId}

export async function saveBookmarkToFirestore(userId: string, story: NewsStory): Promise<void> {
  try {
    const bookmarkRef = doc(firestore, "users", userId, "bookmarks", story.id);
    await setDoc(bookmarkRef, {
      storyId: story.id,
      title: story.title,
      category: story.category || "General",
      source: story.primaryReportingOutlet || "National Desk",
      sourceCount: story.sourceCount || 1,
      timestamp: serverTimestamp(),
      savedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("[Firestore] Failed to save bookmark to Firestore:", err);
  }
}

export async function removeBookmarkFromFirestore(userId: string, storyId: string): Promise<void> {
  try {
    const bookmarkRef = doc(firestore, "users", userId, "bookmarks", storyId);
    await deleteDoc(bookmarkRef);
  } catch (err) {
    console.warn("[Firestore] Failed to remove bookmark from Firestore:", err);
  }
}

export async function getBookmarksFromFirestore(userId: string): Promise<any[]> {
  try {
    const bookmarksCol = collection(firestore, "users", userId, "bookmarks");
    const q = query(bookmarksCol, orderBy("savedAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("[Firestore] Failed to fetch bookmarks from Firestore:", err);
    return [];
  }
}

export async function recordHistoryToFirestore(userId: string, story: NewsStory): Promise<void> {
  try {
    const historyRef = doc(firestore, "users", userId, "history", story.id);
    await setDoc(historyRef, {
      storyId: story.id,
      title: story.title,
      category: story.category || "General",
      source: story.primaryReportingOutlet || "National Desk",
      readAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("[Firestore] Failed to record history to Firestore:", err);
  }
}

// Per-uid dossier chat persistence (users/{userId}/dossier_chats/{storyId})
export async function saveDossierChatToFirestore(
  userId: string,
  storyId: string,
  messages: Array<{ role: string; text: string }>
): Promise<void> {
  try {
    const chatRef = doc(firestore, "users", userId, "dossier_chats", storyId);
    await setDoc(chatRef, {
      storyId,
      messages,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("[Firestore] Failed to save dossier chat:", err);
  }
}

export async function loadDossierChatFromFirestore(
  userId: string,
  storyId: string
): Promise<Array<{ role: string; text: string }> | null> {
  try {
    const chatRef = doc(firestore, "users", userId, "dossier_chats", storyId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    return Array.isArray(data?.messages) ? data.messages : null;
  } catch (err) {
    console.warn("[Firestore] Failed to load dossier chat:", err);
    return null;
  }
}
