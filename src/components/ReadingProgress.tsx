import React, { useState, useEffect } from "react";

interface ReadingProgressProps {
  className?: string;
}

export function ReadingProgress({ className = "" }: ReadingProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentScroll = window.pageYOffset;
      const documentHeight = document.body.scrollHeight - window.innerHeight;
      if (documentHeight > 0) {
        setScrollProgress((currentScroll / documentHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    // Add event listener
    window.addEventListener("scroll", updateScrollProgress);
    // Call once to set initial progress
    updateScrollProgress();

    // Cleanup
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <div className={`w-full h-0.5 bg-rose-600/20 dark:bg-rose-500/20 ${className}`}>
      <div
        className="h-0.5 bg-rose-600 dark:bg-rose-400"
        style={{ width: `${scrollProgress}%` }}
      ></div>
    </div>
  );
}