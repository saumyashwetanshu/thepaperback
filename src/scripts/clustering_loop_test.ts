import { cluster_distance, get_text_embedding } from '../server/services/clustering.service.js';

async function main() {
    console.log("Starting 100+ Loop Test...");
    
    // Warm up embedding model to avoid timing the initialization multiple times
    const warm1 = await get_text_embedding("Warmup text one");
    const warm2 = await get_text_embedding("Warmup text two");
    
    const article1 = {
        title: "RBI keeps repo rate unchanged",
        pubDate: Date.now(),
        embedding: warm1,
        entities: ["RBI"],
        predicate: "keeps"
    };

    const article2 = {
        title: "Reserve Bank of India maintains benchmark interest rate",
        pubDate: Date.now(),
        embedding: warm2,
        entities: ["Reserve Bank of India"],
        predicate: "maintains"
    };

    const ITERATIONS = 120;
    const startMem = process.memoryUsage().rss;
    const t0 = performance.now();
    let maxLatency = 0;
    let exceptions = 0;
    let outputs = new Set();
    
    for (let i = 0; i < ITERATIONS; i++) {
        try {
            const start = performance.now();
            const dist = cluster_distance(article1, article2);
            const end = performance.now();
            const lat = end - start;
            if (lat > maxLatency) maxLatency = lat;
            outputs.add(dist.toFixed(4));
        } catch (e) {
            exceptions++;
        }
    }
    
    const t1 = performance.now();
    const endMem = process.memoryUsage().rss;
    
    console.log(`\n============================`);
    console.log(`100+ LOOP TEST RESULTS`);
    console.log(`============================`);
    console.log(`Iterations:       ${ITERATIONS}`);
    console.log(`Exceptions:       ${exceptions}`);
    console.log(`Avg Latency (ms): ${((t1 - t0) / ITERATIONS).toFixed(4)}`);
    console.log(`Max Latency (ms): ${maxLatency.toFixed(4)}`);
    console.log(`Memory Growth:    ${((endMem - startMem)/1024/1024).toFixed(2)} MB`);
    console.log(`Deterministic:    ${outputs.size === 1 ? 'Yes' : 'No (Multiple output values)'}`);
}

main().catch(console.error);
