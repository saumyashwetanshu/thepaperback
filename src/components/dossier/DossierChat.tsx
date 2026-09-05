import React, { useState, useRef, useEffect } from "react";
import { Send, CornerDownLeft, Sparkles, MessageSquare } from "lucide-react";
import type { NewsStory } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { saveDossierChatToFirestore, loadDossierChatFromFirestore } from "../../services/firebase";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export function DossierChat({ story }: { story: NewsStory }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Load per-uid dossier chat when signed in
  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    (async () => {
      if (!user?.uid) {
        setMessages([]);
        setHydrated(true);
        return;
      }
      const prior = await loadDossierChatFromFirestore(user.uid, story.id);
      if (!cancelled) {
        if (prior && prior.length) {
          setMessages(prior.map((m) => ({
            role: m.role === "model" ? "model" : "user",
            text: String(m.text || "")
          })));
        } else {
          setMessages([]);
        }
        setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid, story.id]);

  // Persist chat turns for signed-in users
  useEffect(() => {
    if (!hydrated || !user?.uid || messages.length === 0) return;
    void saveDossierChatToFirestore(user.uid, story.id, messages);
  }, [messages, hydrated, user?.uid, story.id]);

  const quickPrompts = [
    "What do the full articles agree on across desks?",
    "Which newsroom reported unique details or exclusive claims?",
    "What aspects remain unconfirmed or disputed?"
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = { role: "user", text: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/news/dossier-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId: story.id,
          message: query,
          history: messages // Pass preceding conversation history for true multi-turn context
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages([...newMessages, { role: "model", text: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "model", text: data.error || "The investigative assistant could not process the query at this moment." }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "model", text: "Network error connecting to the investigative dossier engine." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="dossier-chat-section" className="bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 md:p-8 transition-colors shadow-2xs">
      <header className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Interactive Story Analysis
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-black dark:text-white tracking-tight">
            Investigative Dossier Assistant
          </h3>
          <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">
            Grounded multi-turn query engine analyzing indexed desks, omissions, and timeline entries for this story.
            {user ? " Signed-in chats sync to your Firestore uid." : " Sign in with Google to sync chat history."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
        >
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </header>

      {isOpen && (
        <div className="flex flex-col gap-4 mt-5">
          {/* Quick Prompts */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Suggested Analytical Questions
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200/90 dark:border-gray-800 rounded-full text-xs text-gray-700 dark:text-gray-300 transition-colors text-left cursor-pointer disabled:opacity-50 font-sans"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          {messages.length > 0 && (
            <div className="flex flex-col gap-3.5 max-h-[460px] overflow-y-auto pr-1 pt-2 border-t border-gray-100 dark:border-gray-800">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-1 max-w-[88%] ${
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400">
                    {m.role === "user" ? "You" : "The Paperback Editorial Assistant"}
                  </span>
                  <div
                    className={`p-4 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-black text-white dark:bg-white dark:text-black rounded-br-xs"
                        : "bg-gray-50 dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-xs"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mr-auto flex items-center gap-2 text-xs font-sans text-gray-500 py-2">
                  <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping"></div>
                  Synthesizing multi-desk reporting evidence...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an analytical question about this story..."
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-black dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
