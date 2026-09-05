import React, { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";

interface FontSizeControlProps {
  className?: string;
}

export function FontSizeControl({ className = "" }: FontSizeControlProps) {
  const [fontSize, setFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem("paperback_font_size");
      return saved ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    try {
      localStorage.setItem("paperback_font_size", String(fontSize));
    } catch {}
  }, [fontSize]);

  const handleIncrease = () => setFontSize((prev) => Math.min(prev + 10, 140));
  const handleDecrease = () => setFontSize((prev) => Math.max(prev - 10, 80));
  const handleReset = () => setFontSize(100);

  return (
    <div className={`flex items-center gap-1 shrink-0 ${className}`}>
      <button
        type="button"
        onClick={handleDecrease}
        className="flex items-center justify-center w-7 h-7 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:text-white transition-colors"
        title="Decrease font size"
        aria-label="Decrease text size"
      >
        <span className="text-[12px] font-serif font-semibold leading-none">A-</span>
      </button>
      <button
        type="button"
        onClick={handleIncrease}
        className="flex items-center justify-center w-7 h-7 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:text-white transition-colors"
        title="Increase font size"
        aria-label="Increase text size"
      >
        <span className="text-[15px] font-serif font-bold leading-none">A+</span>
      </button>
      {fontSize !== 100 && (
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center w-7 h-7 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors"
          title="Reset font size to 100%"
          aria-label="Reset text size"
        >
          <RotateCcw size={13} />
        </button>
      )}
    </div>
  );
}
