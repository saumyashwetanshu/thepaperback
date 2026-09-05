import React, { useState } from "react";

interface ShareButtonProps {
  story: {
    id: string;
    title: string;
    url?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ShareButton({
  story,
  size = "md",
  className = ""
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareUrl = story.url
        ? (story.url.startsWith("http") ? story.url : `${window.location.origin}${story.url}`)
        : `${window.location.origin}/story/${story.id}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: story.title,
            text: `Reading "${story.title}" on The Paperback`,
            url: shareUrl
          });
          return;
        } catch (shareErr: any) {
          // If user canceled the share dialog, do nothing
          if (shareErr.name === "AbortError") return;
        }
      }

      // Fallback to clipboard copy
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const sizeClasses = {
    sm: "h-7 w-7 text-[16px]",
    md: "h-9 w-9 text-[18px]",
    lg: "h-11 w-11 text-[20px]"
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-all cursor-pointer ${sizeClasses[size]} ${className}`}
      aria-label="Share story"
      title={copied ? "Link copied to clipboard" : "Share story"}
    >
      <span
        className={`material-symbols-outlined transition-transform duration-150 ${copied ? "text-emerald-600 dark:text-emerald-400 scale-110" : ""}`}
        style={{ fontSize: "inherit" }}
      >
        {copied ? "check" : "share"}
      </span>
    </button>
  );
}