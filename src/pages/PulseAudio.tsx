import React, { useEffect, useState } from "react";

type PulsePost = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  readingTimeMinutes: number;
  upvotes: number;
  publishedAt: string;
  author?: { name?: string; role?: string };
  sourcesCited?: { title?: string; url?: string; name?: string }[] | string[];
  tags?: string[];
};

export function PulseAudio() {
  const [posts, setPosts] = useState<PulsePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    summary: "",
    content: "",
    authorName: "",
    sources: "",
    category: "Opinion",
  });

  const load = async () => {
    try {
      const res = await fetch("/api/pulse/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const sourcesCited = draft.sources
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title, url] = line.split("|").map((s) => s.trim());
          return { title: title || url, url: url || title };
        });
      const res = await fetch("/api/pulse/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          summary: draft.summary,
          content: draft.content,
          category: draft.category,
          authorName: draft.authorName || "Community columnist",
          authorRole: "Opinion",
          sourcesCited,
          tags: [draft.category, "Opinion"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not publish");
      setDraft({ title: "", summary: "", content: "", authorName: "", sources: "", category: "Opinion" });
      setOpen(false);
      await load();
    } catch (err: any) {
      setError(err.message || "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 max-w-[960px] mx-auto w-full px-4 md:px-10 py-8 md:py-12 bg-white dark:bg-black font-sans transition-colors">
      <header className="mb-10 border-b border-gray-200/90 dark:border-gray-800 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-sm bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest leading-none">
                Opinion & Columns
              </span>
              <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-sans">
                Perspectives
              </span>
            </div>
            <h1 className="text-[40px] md:text-[52px] font-black tracking-[-0.03em] leading-none text-black dark:text-white mb-3">
              Pulse
            </h1>
            <p className="text-[17px] md:text-[18px] text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Labeled commentary, analytical columns, and field notes. Labeled explicitly as opinion with sources cited.
            </p>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[12px] font-bold uppercase tracking-widest hover:opacity-85 transition-all self-start sm:self-auto flex items-center gap-2 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">{open ? "close" : "edit"}</span>
            <span>{open ? "Close Editor" : "Write Column"}</span>
          </button>
        </div>
      </header>

      {open && (
        <form onSubmit={publish} className="mb-12 border border-gray-200/90 dark:border-gray-800 p-6 md:p-8 rounded-2xl flex flex-col gap-4 bg-gray-50 dark:bg-gray-900/90 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <span className="text-[11px] font-bold uppercase tracking-widest text-black dark:text-white">Draft Column / Opinion</span>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Must cite source stories</span>
          </div>
          <input
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl px-4 py-2.5 text-base text-black dark:text-white placeholder:text-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none"
            placeholder="Headline"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            required
          />
          <input
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl px-4 py-2.5 text-base text-black dark:text-white placeholder:text-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none"
            placeholder="Dek / summary"
            value={draft.summary}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            required
          />
          <textarea
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl px-4 py-3 text-base text-black dark:text-white placeholder:text-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none min-h-[140px]"
            placeholder="The argument. Quote the coverage you are reacting to."
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            required
          />
          <input
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl px-4 py-2.5 text-base text-black dark:text-white placeholder:text-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none"
            placeholder="Your name or affiliation"
            value={draft.authorName}
            onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
          />
          <textarea
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none min-h-[72px] font-sans"
            placeholder={"Sources cited (one per line): Outlet headline | https://link"}
            value={draft.sources}
            onChange={(e) => setDraft({ ...draft, sources: e.target.value })}
          />
          {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="self-start px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[12px] font-bold uppercase tracking-widest hover:opacity-85 disabled:opacity-50 transition-all"
          >
            {saving ? "Publishing..." : "Publish Opinion"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-400 font-bold py-12">Loading commentary...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No opinion posts on the desk yet.
        </div>
      ) : (
        <section className="flex flex-col gap-8">
          {posts.map((post) => (
            <article key={post.id} className="border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 md:p-8 bg-white dark:bg-gray-950 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Opinion
                </span>
                <span className="text-gray-300 dark:text-gray-700">&bull;</span>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {post.author?.name || "Guest Columnist"}
                </span>
                <span className="text-gray-300 dark:text-gray-700">&bull;</span>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                  {post.readingTimeMinutes || 1} min read
                </span>
              </div>
              
              <h2 className="text-[24px] md:text-[28px] font-black tracking-tight leading-snug text-black dark:text-white mt-1">
                {post.title}
              </h2>
              
              <p className="text-[16px] font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                {post.summary}
              </p>
              
              <p className="text-[15px] text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
              
              {!!post.sourcesCited?.length && (
                <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Sources Cited:</span>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {post.sourcesCited.map((src, i) => {
                      const title = typeof src === "string" ? src : src.title || src.name || src.url;
                      const url = typeof src === "string" ? undefined : src.url;
                      return (
                        <li key={i}>
                          {url ? (
                            <a className="underline hover:text-black dark:hover:text-white transition-colors" href={url} target="_blank" rel="noreferrer">
                              {title}
                            </a>
                          ) : (
                            title
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
