import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { formatAuthError } from "../services/firebase";
import { X, Lock, Mail, User as UserIcon, Shield } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginAnonymously, authError, clearAuthError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const showError = (err: unknown) => {
    setError(formatAuthError(err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearAuthError();
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    clearAuthError();
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      const msg = formatAuthError(err);
      if (msg.includes("Redirecting to Google sign-in")) {
        return;
      }
      showError(err);
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError(null);
    clearAuthError();
    setLoading(true);
    try {
      await loginAnonymously();
      onClose();
    } catch (err: any) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md my-auto bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all max-h-[calc(100vh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <header className="mb-5 pr-8">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-4 h-4 text-rose-600" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Firebase Auth & Isolated Storage
            </span>
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-black text-black dark:text-white tracking-tight">
            {isRegister ? "Create Analyst Account" : "Sign In to The Paperback"}
          </h2>
          <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">
            Sync saved dossiers, reading history, and intelligence across devices.
          </p>
        </header>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 break-words font-mono whitespace-pre-wrap">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/90 dark:border-gray-800 rounded-xl text-sm font-bold text-black dark:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {loading ? "Redirecting to Google..." : "Continue with Google"}
          </button>

          <button
            type="button"
            onClick={handleAnonymous}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-sans font-bold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5 text-gray-500" />
            Instant Guest Analyst Access (Firebase Anonymous)
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-950 px-2 text-gray-400 font-sans">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" autoComplete="on">
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-black dark:text-white focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-black dark:text-white focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-bold tracking-tight hover:opacity-90 transition-opacity cursor-pointer"
          >
            {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-center text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline cursor-pointer"
          >
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}