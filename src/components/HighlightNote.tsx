import React, { useState, useEffect, useRef } from "react";
import type { NewsStory } from "../types";

interface HighlightNoteProps {
  story: NewsStory;
  text?: string;
  className?: string;
}

interface Highlight {
  id: string;
  text: string;
  note: string;
  timestamp: number;
  range: {
    startOffset: number;
    endOffset: number;
  };
}

interface HighlightData {
  highlights: Highlight[];
}

export function HighlightNote({
  story,
  text,
  className = ""
}: HighlightNoteProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<{ startOffset: number; endOffset: number } | null>(null);

  // Load highlights from localStorage on mount
  useEffect(() => {
    try {
      const highlightsRaw = localStorage.getItem(`paperback_highlights_${story.id}`);
      const highlightsData: HighlightData = highlightsRaw
        ? JSON.parse(highlightsRaw)
        : { highlights: [] };
      setHighlights(highlightsData.highlights);
    } catch (err) {
      console.warn("Could not load highlights:", err);
    }
  }, [story.id]);

  // Save highlights to localStorage
  useEffect(() => {
    try {
      const highlightsData: HighlightData = { highlights };
      localStorage.setItem(
        `paperback_highlights_${story.id}`,
        JSON.stringify(highlightsData)
      );
    } catch (err) {
      console.warn("Could not save highlights:", err);
    }
  }, [highlights, story.id]);

  // Handle text selection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText("");
      setShowNoteInput(false);
      return;
    }

    const selected = selection.toString().trim();
    if (selected.length > 10) { // Only allow highlighting of meaningful text
      setSelectedText(selected);

      // Get range positions
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(containerRef.current!);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const startOffset = preSelectionRange.toString().length;

      const endOffset = startOffset + selected.length;

      selectionRef.current = { startOffset, endOffset };
      setShowNoteInput(true);
    } else {
      setSelectedText("");
      setShowNoteInput(false);
    }
  };

  // Handle note submission
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectionRef.current) return;

    const newHighlight: Highlight = {
      id: `highlight-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: selectedText,
      note: noteText.trim(),
      timestamp: Date.now(),
      range: selectionRef.current
    };

    setHighlights(prev => [...prev, newHighlight]);
    setSelectedText("");
    setShowNoteInput(false);
    setNoteText("");

    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // Handle note cancellation
  const handleNoteCancel = () => {
    setSelectedText("");
    setShowNoteInput(false);
    setNoteText("");
    window.getSelection()?.removeAllRanges();
  };

  // Delete a highlight
  const deleteHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className={`relative ${className}`}
      style={{
        WebkitUserSelect: "text",
        MozUserSelect: "text",
        userSelect: "text"
      }}
    >
      {/* Render story content with highlights */}
      <div className="text-[16px] md:text-[17px] text-gray-800 dark:text-gray-200 leading-relaxed space-y-4 font-normal">
        {(text || story.summary || story.description || "").split('\n').filter(p => p.trim() !== '').map((para, i) => (
          <p
            key={i}
            dangerouslySetInnerHTML={{
              __html: applyHighlights(para, highlights)
            }}
          />
        ))}
      </div>

      {/* Note input popup */}
      {showNoteInput && selectedText && (
        <div className="absolute z-50 mt-2 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-64">
          <form onSubmit={handleNoteSubmit} className="space-y-3">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                Selected: "{selectedText.substring(0, 30)}..."
              </span>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-rose-600 dark:focus:ring-rose-500 focus:border-rose-600 dark:focus:border-rose-500 resize-none h-16"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleNoteCancel}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors text-sm disabled:opacity-50"
                disabled={!noteText.trim()}
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Highlights list */}
      {highlights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
            Your Highlights ({highlights.length})
          </h3>
          <div className="space-y-2">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                <p className="text-xs text-gray-700 dark:text-gray-300 italic mb-1">
                  "{highlight.text}"
                </p>
                {highlight.note && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Note:</span> {highlight.note}
                  </p>
                )}
                <button
                  onClick={() => deleteHighlight(highlight.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to apply highlights to text
function applyHighlights(text: string, highlights: Highlight[]): string {
  if (!text || highlights.length === 0) return text;

  // Sort highlights by start offset descending to avoid index shifting
  const sortedHighlights = [...highlights].sort((a, b) =>
    b.range.startOffset - a.range.startOffset
  );

  let result = text;

  for (const highlight of sortedHighlights) {
    const { startOffset, endOffset } = highlight.range;
    const before = result.substring(0, startOffset);
    const highlighted = result.substring(startOffset, endOffset);
    const after = result.substring(endOffset);

    result = `${before}<mark className="bg-rose-100 dark:bg-rose-900/50 px-0.5 rounded">${highlighted}</mark>${after}`;
  }

  return result;
}