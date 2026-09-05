import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import dbPromise from "../../utils/db";

// Validate JWT secret is set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Validation schemas
const pulsePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  category: z.string().optional(),
  summary: z.string().min(1, "Summary is required").max(500, "Summary too long"),
  content: z.string().min(1, "Content is required").max(5000, "Content too long"),
  sourcesCited: z.array(z.string()).optional(),
  authorName: z.string().optional(),
  authorRole: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const pulseLikeIdSchema = z.object({
  id: z.string().min(1, "Post ID is required").max(50, "Post ID too long")
});

const router = express.Router();

async function seedOpinionIfEmpty(db: any) {
  const fromPersp = await db.all(
    `SELECT source, title, url, quote, leadParagraph, narrativeSummary FROM perspectives
     WHERE lower(source) LIKE '%opindia%'
        OR lower(source) LIKE '%swarajya%'
        OR lower(source) LIKE '%quint%'
     ORDER BY rowid DESC LIMIT 24`
  ) as any[];
  const fromWire = await db.all(
    `SELECT source, title, url, NULL as quote, NULL as leadParagraph, NULL as narrativeSummary FROM live_wire
     WHERE lower(source) LIKE '%opindia%'
        OR lower(source) LIKE '%swarajya%'
        OR lower(source) LIKE '%quint%'
     ORDER BY rowid DESC LIMIT 24`
  ) as any[];
  const rows = [...(fromPersp || []), ...(fromWire || [])];
  for (const row of rows || []) {
    if (!row.title) continue;
    const dup = await db.get('SELECT id FROM pulse_posts WHERE title = ?', [row.title]);
    if (dup) continue;
    const id = `pulse-seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const body = row.narrativeSummary || row.leadParagraph || row.quote || row.title || "";
    const summary = String(body).slice(0, 280);
    const content = `${body}\n\nThis item is labeled opinion/commentary from ${row.source}. It is not a Paperback news report. Read the original before treating any line as fact.`;
    await db.run(
      'INSERT INTO pulse_posts (id, title, category, summary, content, authorId, authorName, authorRole, authorAvatar, sourcesCited, readingTimeMinutes, upvotes, hasUpvoted, publishedAt, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        row.title,
        "Opinion",
        summary,
        content,
        null,
        row.source,
        "Labeled opinion desk",
        String(row.source || "OP").slice(0, 2).toUpperCase(),
        JSON.stringify([{ title: row.title, url: row.url }]),
        2,
        0,
        0,
        new Date().toISOString(),
        JSON.stringify(["Opinion", row.source])
      ]
    );
  }
}


router.get("/posts", async (req, res) => {
  try {
    // Validate query parameters
    const paginationSchema = z.object({
    page: z.string().regex(/^\d+$/, "Page must be a positive integer").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").optional()
  });

  const paginationValidation = paginationSchema.safeParse(req.query);
  if (!paginationValidation.success) {
    return res.status(400).json({ success: false, error: "Invalid pagination parameters" });
  }

  const page = parseInt(paginationValidation.data.page || "1", 10);
  const limit = parseInt(paginationValidation.data.limit || "20", 10);
  const offset = (page - 1) * limit;

  const db = await dbPromise;
  try { await seedOpinionIfEmpty(db); } catch (e) { console.warn('Pulse seed skipped:', e); }
  const posts = await db.all('SELECT * FROM pulse_posts ORDER BY publishedAt DESC LIMIT ? OFFSET ?', [limit, offset]) as any[];
  const totalRow = await db.get('SELECT COUNT(*) as count FROM pulse_posts') as any;

  const formattedPosts = posts.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    summary: p.summary,
    content: p.content,
    readingTimeMinutes: p.readingTimeMinutes,
    upvotes: p.upvotes,
    publishedAt: p.publishedAt,
    author: {
      id: p.authorId,
      name: p.authorName,
      role: p.authorRole,
      avatar: p.authorAvatar
    },
    sourcesCited: p.sourcesCited ? JSON.parse(p.sourcesCited) : [],
    tags: p.tags ? JSON.parse(p.tags) : [],
    hasUpvoted: p.hasUpvoted === 1
  }));

  res.json({
    success: true,
    posts: formattedPosts,
    pagination: { page, limit, total: totalRow.count }
  });
  } catch (err) {
    console.error("API /api/posts Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    // Validate request body
    const postValidation = pulsePostSchema.safeParse(req.body);
    if (!postValidation.success) {
      return res.status(400).json({ success: false, error: "Invalid post data" });
    }

    const { title, category, summary, content, sourcesCited, authorName, authorRole, tags } = postValidation.data;

    const words = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const authHeader = req.headers.authorization || (req.headers["x-session-token"] as string);
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : null;
    const db = await dbPromise;

    let user = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        if (decoded && decoded.userId) {
          user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
        }
      } catch(e) {
        // Ignore invalid token
      }
    }

    const finalAuthorName = (authorName || user?.name || "Community Columnist").trim();
    const authorInitials = finalAuthorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "CC";

    const newPost = {
      id: `pulse-post-${Date.now()}`,
      title: title.trim(),
      category: category || "Field Report",
      summary: summary.trim(),
      content: content.trim(),
      authorId: user?.id || null,
      authorName: finalAuthorName,
      authorRole: (authorRole || user?.role || user?.affiliation || "Independent Analyst").trim(),
      authorAvatar: authorInitials,
      sourcesCited: JSON.stringify(Array.isArray(sourcesCited) ? sourcesCited : (sourcesCited ? [sourcesCited] : [])),
      readingTimeMinutes: readingTime,
      upvotes: 1,
      hasUpvoted: 1,
      publishedAt: "Just now",
      tags: JSON.stringify(Array.isArray(tags) ? tags : (tags ? [tags] : [category || "Analysis"]))
    };

    await db.run(
      'INSERT INTO pulse_posts (id, title, category, summary, content, authorId, authorName, authorRole, authorAvatar, sourcesCited, readingTimeMinutes, upvotes, hasUpvoted, publishedAt, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newPost.id, newPost.title, newPost.category, newPost.summary, newPost.content, newPost.authorId, newPost.authorName, newPost.authorRole, newPost.authorAvatar, newPost.sourcesCited, newPost.readingTimeMinutes, newPost.upvotes, newPost.hasUpvoted, newPost.publishedAt, newPost.tags]
    );

    res.json({
      success: true,
      post: {
        ...newPost,
        sourcesCited: JSON.parse(newPost.sourcesCited),
        tags: JSON.parse(newPost.tags),
        author: {
          id: newPost.authorId,
          name: newPost.authorName,
          role: newPost.authorRole,
          avatar: newPost.authorAvatar
        }
      }
    });
  } catch (err) {
    console.error("API POST /api/pulse/posts Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.post("/posts/:id/like", async (req, res) => {
  // Validate ID parameter
  const idValidation = pulseLikeIdSchema.safeParse(req.params);
  if (!idValidation.success) {
    return res.status(400).json({ success: false, error: "Invalid post ID" });
  }

  const db = await dbPromise;
  const post = await db.get('SELECT * FROM pulse_posts WHERE id = ?', [idValidation.data.id]);

  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  let newUpvotes = post.upvotes;
  let newHasUpvoted = post.hasUpvoted;

  if (post.hasUpvoted) {
    newUpvotes = Math.max(0, post.upvotes - 1);
    newHasUpvoted = 0;
  } else {
    newUpvotes = post.upvotes + 1;
    newHasUpvoted = 1;
  }

  await db.run('UPDATE pulse_posts SET upvotes = ?, hasUpvoted = ? WHERE id = ?', [newUpvotes, newHasUpvoted, idValidation.data.id]);

  res.json({
    success: true,
    upvotes: newUpvotes,
    hasUpvoted: newHasUpvoted === 1
  });
});

export default router;
