import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search as SearchIcon, Sun, Moon, ChevronDown } from "lucide-react";
import { FontSizeControl } from "./FontSizeControl";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { AuthModal } from "./AuthModal";

export function Header() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  React.useEffect(() => {
    const open = () => setAuthModalOpen(true);
    window.addEventListener('paperback:open-auth', open);
    return () => window.removeEventListener('paperback:open-auth', open);
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("paperback_theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("paperback_theme", "dark");
      setIsDarkMode(true);
    }
  };

  const primaryLinks = [
    { label: "Home", path: "/" },
    { label: "Search", path: "/search" },
    { label: "Live Wire", path: "/live" },
  ];

  const moreLinks = [
    { label: "Fact Check", path: "/fact-check" },
    { label: "Voices", path: "/voices" },
    { label: "Pulse", path: "/pulse" },
    { label: "Protocol", path: "/protocol" },
  ];

  const navLinks = [...primaryLinks, ...moreLinks];
  const moreActive = moreLinks.some((l) => currentPath === l.path);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.location.href = "/search";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
  }, [currentPath]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/92 dark:bg-black/92 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-4 min-w-0">
          <Link 
            to="/" 
            className="flex flex-col group min-w-0"
          >
            <span className="font-black text-[22px] md:text-[26px] tracking-[-0.045em] text-black dark:text-white group-hover:text-rose-600 transition-colors leading-none">
              The Paperback
            </span>
            <span className="mt-1 flex items-center gap-2 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              <span className="text-rose-600 dark:text-rose-500">India</span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="normal-case tracking-tight font-medium text-gray-500 dark:text-gray-400 truncate">
                {formattedDate}
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-gray-900/80 p-1 rounded-full border border-gray-200/60 dark:border-gray-800">
          {primaryLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`px-3.5 py-1 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`px-3.5 py-1 rounded-full text-[13px] font-semibold transition-all duration-200 inline-flex items-center gap-1 ${
                moreActive || moreOpen
                  ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
            >
              More
              <ChevronDown size={14} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 min-w-[160px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg p-1.5 z-50"
              >
                {moreLinks.map((link) => {
                  const isActive = currentPath === link.path;
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      role="menuitem"
                      className={`block px-3 py-2 rounded-lg text-[13px] font-semibold ${
                        isActive
                          ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/search"
            aria-label="Search articles"
            className="hidden sm:flex items-center gap-2 bg-gray-100/90 dark:bg-gray-900 hover:bg-gray-200/80 dark:hover:bg-gray-800 px-3 py-1.5 rounded-full text-[12px] font-medium text-gray-500 dark:text-gray-400 transition-all border border-transparent hover:border-gray-300/60"
          >
            <SearchIcon size={14} className="text-gray-500 dark:text-gray-400" />
            <span className="font-normal text-gray-600 dark:text-gray-400">Search</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 bg-white dark:bg-black text-[10px] font-sans font-medium text-gray-400 dark:text-gray-500 rounded border border-gray-200 dark:border-gray-800 shadow-2xs">
              Ctrl K
            </kbd>
          </Link>

          <Link
            to="/search"
            aria-label="Search"
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <SearchIcon size={18} />
          </Link>

          {/* Language Toggle: EN (Default) vs HI */}
          <div className="flex items-center rounded-full bg-gray-100 dark:bg-gray-900 p-0.5 border border-gray-200/80 dark:border-gray-800 text-[11px] font-bold tracking-tight shrink-0">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-2xs font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium'
              }`}
              title="English (Default)"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow-2xs font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium'
              }`}
              title="हिन्दी (Hindi)"
            >
              HI
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Toggle color mode"
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <FontSizeControl className="hidden lg:flex" />

          {user ? (
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => logout()}
                title={`Signed in as ${user.email || 'Guest'}. Click to sign out.`}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-800 text-[11px] font-sans font-medium text-black dark:text-white transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="truncate max-w-[90px]">{user.email ? user.email.split('@')[0] : 'Analyst'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-[12px] font-bold tracking-tight hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-1">
            India | {formattedDate}
          </div>
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}