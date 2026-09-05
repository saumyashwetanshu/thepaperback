import dbPromise from '../utils/db.js';

async function test() {
    const db = await dbPromise;
    const rows = await db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN ('live_wire', 'live_wire_fts')");
    console.log(JSON.stringify(rows, null, 2));

    const triggers = await db.all("SELECT name, sql FROM sqlite_master WHERE type='trigger' AND tbl_name='live_wire'");
    console.log(JSON.stringify(triggers, null, 2));
}

test().catch(console.error);
