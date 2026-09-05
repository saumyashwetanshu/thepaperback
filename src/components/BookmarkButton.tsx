import React, { useState } from "react";
import { recordStoryRead } from "../utils/readingLedger";
import { useAuth } from "../context/AuthContext";
import {
  saveBookmarkToFirestore,
  removeBookmarkFromFirestore,
  recordHistoryToFirestore,
  getBookmarksFromFirestore,
} from "../services/firebase";
import type { NewsStory } from "../types";

interface BookmarkButtonProps {
  story: NewsStory;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BookmarkButton({
  story,
  size = "md",
  className = ""
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);

  // Firestore is the source of truth when signed in (user-isolated /users/{uid}/bookmarks).
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        if (!cancelled) setIsBookmarked(false);
        return;
      }
      try {
        const rows = await getBookmarksFromFirestore(user.uid);
        if (cancelled) return;
        setIsBookmarked(
          (rows || []).some(
            (r: any) => String(r.id || r.storyId || "") === String(story.id)
          )
        );
      } catch (err) {
        console.warn("Could not load Firestore bookmarks:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, story.id]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    if (!user) {
      window.dispatchEvent(new CustomEvent("paperback:open-auth"));
      return;
    }

    setBusy(true);
    try {
      recordStoryRead(story);
      recordHistoryToFirestore(user.uid, story);

      if (isBookmarked) {
        await removeBookmarkFromFirestore(user.uid, story.id);
        setIsBookmarked(false);
      } else {
        await saveBookmarkToFirestore(user.uid, story);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error("Bookmark failed:", err);
    } finally {
      setBusy(false);
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
      onClick={handleBookmark}
      disabled={busy}
      className={`flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-all cursor-pointer disabled:opacity-60 ${sizeClasses[size]} ${className}`}
      aria-label={
        !user
          ? "Sign in to bookmark"
          : isBookmarked
            ? "Remove bookmark"
            : "Bookmark story"
      }
      title={
        !user
          ? "Sign in to save bookmarks to your account"
          : isBookmarked
            ? "Remove from bookmarks"
            : "Save to bookmarks"
      }
    >
      <span
        className={`material-symbols-outlined transition-transform duration-150 ${isBookmarked ? "text-rose-600 dark:text-rose-400 scale-110" : ""}`}
        style={{ fontSize: "inherit" }}
      >
        {isBookmarked ? "bookmark" : "bookmark_border"}
      </span>
    </button>
  );
}