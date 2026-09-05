import { embedHeadline } from '../server/services/embed.minilm.js';
import { pairwiseSimilarity, cluster_distance } from '../server/services/clustering.service.js';

function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] ** 2;
        normB += vecB[i] ** 2;
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function computeMetrics(tp: number, fp: number, tn: number, fn: number) {
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
    return {
        precision: precision.toFixed(4),
        recall: recall.toFixed(4),
        f1: f1.toFixed(4),
        false_merges: fp,
        false_splits: fn
    };
}

async function main() {
    console.log("Loading dataset...");

    // Same event (Expect MATCH -> distance < 0.48)
    const sameEvent = Array.from({length: 50}, (_, i) => ({ 
        t1: "RBI keeps repo rate at 6." + i + "%", 
        t2: "RBI maintains benchmark rate unchanged at 6." + i + "%" 
    }));
    
    // Same topic / different event (Expect NO MATCH -> distance >= 0.48)
    const sameTopic = Array.from({length: 50}, (_, i) => ({ 
        t1: "Supreme Court hears NEET case " + i, 
        t2: "Supreme Court rules on Delhi demolition " + i 
    }));
    
    // Contradiction / opposite event (Expect NO MATCH -> distance >= 0.48)
    const contradiction = Array.from({length: 50}, (_, i) => ({ 
        t1: "RBI cuts repo rate to 6." + i + "%", 
        t2: "RBI raises repo rate to 7." + i + "%" 
    }));

    // Unrelated pairs (Expect NO MATCH -> distance >= 0.48)
    const unrelated = Array.from({length: 50}, (_, i) => ({ 
        t1: "India defeats Australia by " + i + " wickets", 
        t2: "Gold prices rise globally to " + (i+50) + "k" 
    }));
    
    // Cross-lingual same event (Expect MATCH -> distance < 0.48)
    const crossLingual = Array.from({length: 50}, (_, i) => ({ 
        t1: "RBI keeps repo rate at 6." + i + "%", 
        t2: "आरबीआई ने रेपो रेट 6." + i + " प्रतिशत पर बरकरार रखा" 
    }));

    const dataset = [
        ...sameEvent.map(p => ({ ...p, expected: 'match', type: 'sameEvent' })),
        ...sameTopic.map(p => ({ ...p, expected: 'nomatch', type: 'sameTopic' })),
        ...contradiction.map(p => ({ ...p, expected: 'nomatch', type: 'contradiction' })),
        ...unrelated.map(p => ({ ...p, expected: 'nomatch', type: 'unrelated' })),
        ...crossLingual.map(p => ({ ...p, expected: 'match', type: 'crossLingual' }))
    ];

    const results = {
        'TF-IDF': { tp: 0, fp: 0, tn: 0, fn: 0 },
        'MiniLM': { tp: 0, fp: 0, tn: 0, fn: 0 },
        'Hybrid': { tp: 0, fp: 0, tn: 0, fn: 0 }
    };

    const now = Date.now();
    
    console.log(`Running on ${dataset.length} pairs...`);
    
    // We need extractEntitiesDetailed for Hybrid
    const { extractEntitiesDetailed } = await import('../server/services/nlp/entity.service.js');

    for (const pair of dataset) {
        const tfidfSim = pairwiseSimilarity(pair.t1, pair.t2);
        const tfidfDist = 1 - tfidfSim;
        const tfidfMatch = tfidfDist < 0.48;

        const emb1 = await embedHeadline(pair.t1);
        const emb2 = await embedHeadline(pair.t2);
        const mlmSim = cosineSimilarity(emb1, emb2);
        const mlmDist = 1 - mlmSim;
        const mlmMatch = mlmDist < 0.48;

        // Build proper objects for Hybrid
        const ent1 = await extractEntitiesDetailed(pair.t1);
        const ent2 = await extractEntitiesDetailed(pair.t2);
        
        const articleA = { title: pair.t1, pubDate: now, embedding: emb1, entities: ent1.map(e => e.normalized || e.text) };
        const articleB = { title: pair.t2, pubDate: now, embedding: emb2, entities: ent2.map(e => e.normalized || e.text) };

        const hybridDist = cluster_distance(articleA, articleB);
        const hybridMatch = hybridDist < 0.48;

        // Evaluate
        const isMatch = pair.expected === 'match';

        // TF-IDF
        if (isMatch && tfidfMatch) results['TF-IDF'].tp++;
        if (isMatch && !tfidfMatch) results['TF-IDF'].fn++; // False split
        if (!isMatch && !tfidfMatch) results['TF-IDF'].tn++;
        if (!isMatch && tfidfMatch) results['TF-IDF'].fp++; // False merge

        // MiniLM
        if (isMatch && mlmMatch) results['MiniLM'].tp++;
        if (isMatch && !mlmMatch) results['MiniLM'].fn++;
        if (!isMatch && !mlmMatch) results['MiniLM'].tn++;
        if (!isMatch && mlmMatch) results['MiniLM'].fp++;

        // Hybrid
        if (isMatch && hybridMatch) results['Hybrid'].tp++;
        if (isMatch && !hybridMatch) results['Hybrid'].fn++;
        if (!isMatch && !hybridMatch) results['Hybrid'].tn++;
        if (!isMatch && hybridMatch) results['Hybrid'].fp++;
    }

    console.log("\n=================================");
    console.log("CLUSTERING BENCHMARK RESULTS");
    console.log("=================================\n");

    for (const model of ['TF-IDF', 'MiniLM', 'Hybrid']) {
        console.log(`\n--- ${model} ---`);
        const metrics = computeMetrics(results[model].tp, results[model].fp, results[model].tn, results[model].fn);
        console.log(`Precision: ${metrics.precision}`);
        console.log(`Recall:    ${metrics.recall}`);
        console.log(`F1 Score:  ${metrics.f1}`);
        console.log(`False Merges (FP): ${metrics.false_merges}`);
        console.log(`False Splits (FN): ${metrics.false_splits}`);
    }
}

main().catch(console.error);
