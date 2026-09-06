import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { 
  auth, 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  loginAnonymously, 
  logoutUser,
  completeGoogleRedirect
} from "../services/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string) => Promise<User>;
  loginAnonymously: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  clearAuthError: () => {},
  loginWithGoogle: async () => { throw new Error("Uninitialized"); },
  loginWithEmail: async () => { throw new Error("Uninitialized"); },
  registerWithEmail: async () => { throw new Error("Uninitialized"); },
  loginAnonymously: async () => { throw new Error("Uninitialized"); },
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Complete Google redirect sign-in if we just returned from IdP.
    (async () => {
      try {
        await completeGoogleRedirect();
      } catch (err: any) {
        if (!cancelled) {
          const code = err?.code ? String(err.code) : "";
          let message = err?.message ? String(err.message) : "Google redirect sign-in failed.";
          message = message.replace(/^Firebase:\s*/i, "").replace(/\s*\([^\)]*\)\.?\s*$/, "").trim();
          setAuthError(code && message ? code + ": " + message : (code || message));
        }
      }
    })();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        clearAuthError: () => setAuthError(null),
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAnonymously,
        logout: logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
