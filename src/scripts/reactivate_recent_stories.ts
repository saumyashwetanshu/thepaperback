/**
 * One-shot: reactivate ARCHIVED stories from the last 7 days in .data/thepaperback.db
 */
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

async function main() {
  const dbPath = path.resolve(".data", "thepaperback.db");
  console.log("Reactivating against:", dbPath);
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  const before = await db.all("SELECT status, COUNT(*) as n FROM stories GROUP BY status");
  console.log("Before:", before);
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const result = await db.run(
    `UPDATE stories SET status = 'ACTIVE' WHERE status = 'ARCHIVED' AND COALESCE(updatedAt, timestamp) > ?`,
    [cutoff]
  );
  console.log(`Updated ${(result as any)?.changes ?? 0} rows (cutoff ${cutoff})`);
  const after = await db.all("SELECT status, COUNT(*) as n FROM stories GROUP BY status");
  console.log("After:", after);
  await db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});