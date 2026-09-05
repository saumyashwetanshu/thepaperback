import dbPromise from '../utils/db.js';

async function main() {
    try {
        const db = await dbPromise;
        const liveWireCount = await db.get('SELECT count(*) as count FROM live_wire') as { count: number };
        const ftsCount = await db.get('SELECT count(*) as count FROM live_wire_fts') as { count: number };
        console.log(`Live Wire Count: ${liveWireCount.count}`);
        console.log(`FTS Count: ${ftsCount.count}`);
    } catch (e) {
        console.error(e);
    }
}

main();
