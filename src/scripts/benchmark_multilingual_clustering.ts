import { pipeline } from '@xenova/transformers';

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
    console.log("Generating dataset...");

    // Same event (Expect MATCH)
    const sameEvent = Array.from({length: 50}, (_, i) => ({ 
        t1: "RBI keeps repo rate at 6." + i + "%", 
        t2: "RBI maintains benchmark rate unchanged at 6." + i + "%" 
    }));
    
    // Same topic / different event (Expect NO MATCH)
    const sameTopic = Array.from({length: 50}, (_, i) => ({ 
        t1: "Supreme Court hears NEET case " + i, 
        t2: "Supreme Court rules on Delhi demolition " + i 
    }));
    
    // Contradiction / opposite event (Expect NO MATCH)
    const contradiction = Array.from({length: 50}, (_, i) => ({ 
        t1: "RBI cuts repo rate to 6." + i + "%", 
        t2: "RBI raises repo rate to 7." + i + "%" 
    }));

    // Unrelated pairs (Expect NO MATCH)
    const unrelated = Array.from({length: 50}, (_, i) => ({ 
        t1: "India defeats Australia by " + i + " wickets", 
        t2: "Gold prices rise globally to " + (i+50) + "k" 
    }));
    
    // Cross-lingual same event (Expect MATCH)
    const crossLingual = [
        ...Array.from({length: 10}, (_, i) => ({ t1: "RBI keeps repo rate at 6." + i + "%", t2: "आरबीआई ने रेपो रेट 6." + i + " प्रतिशत पर बरकरार रखा" })), // Hindi
        ...Array.from({length: 10}, (_, i) => ({ t1: "RBI keeps repo rate at 6." + i + "%", t2: "আরবিআই রেপো রেট ৬." + i + "% এ অপরিবর্তিত রেখেছে" })), // Bengali
        ...Array.from({length: 10}, (_, i) => ({ t1: "RBI keeps repo rate at 6." + i + "%", t2: "आरबीआयने रेपो दर ६." + i + " टक्क्यांवर कायम ठेवला" })), // Marathi
        ...Array.from({length: 10}, (_, i) => ({ t1: "RBI keeps repo rate at 6." + i + "%", t2: "ஆர்பிஐ ரெப்போ விகிதத்தை 6." + i + "% ஆக மாற்றாமல் வைத்துள்ளது" })), // Tamil
        ...Array.from({length: 10}, (_, i) => ({ t1: "RBI keeps repo rate at 6." + i + "%", t2: "ఆర్‌బిఐ రెపో రేటును 6." + i + " శాతం వద్దే ఉంచింది" })), // Telugu
        ...Array.from({length: 10}, (_, i) => ({ t1: "आरबीआई ने रेपो रेट 6." + i + " प्रतिशत पर बरकरार रखा", t2: "আরবিআই রেপো রেট ৬." + i + "% এ অপরিবর্তিত রেখেছে" })) // Hindi <-> Bengali
    ];

    const dataset = [
        ...sameEvent.map(p => ({ ...p, expected: 'match', type: 'sameEvent' })),
        ...sameTopic.map(p => ({ ...p, expected: 'nomatch', type: 'sameTopic' })),
        ...contradiction.map(p => ({ ...p, expected: 'nomatch', type: 'contradiction' })),
        ...unrelated.map(p => ({ ...p, expected: 'nomatch', type: 'unrelated' })),
        ...crossLingual.map(p => ({ ...p, expected: 'match', type: 'crossLingual' }))
    ];

    console.log(`Dataset size: ${dataset.length} pairs`);

    // Models to evaluate
    const models = [
        { name: 'Xenova/all-MiniLM-L6-v2', threshold: 0.48 }, // Distance threshold < 0.48 means match
        { name: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2', threshold: 0.48 }
    ];

    const finalResults: any = {};

    for (const m of models) {
        console.log(`\nEvaluating ${m.name}...`);
        
        let memBefore = process.memoryUsage().heapUsed;
        let t0 = performance.now();
        const extractor = await pipeline('feature-extraction', m.name);
        let t1 = performance.now();
        let memAfter = process.memoryUsage().heapUsed;
        const coldStart = t1 - t0;
        const memGrowth = memAfter - memBefore;
        
        let tp = 0, fp = 0, tn = 0, fn = 0;
        let totalLatency = 0;

        for (const pair of dataset) {
            let s0 = performance.now();
            const out1 = await extractor(pair.t1, { pooling: 'mean', normalize: true });
            const out2 = await extractor(pair.t2, { pooling: 'mean', normalize: true });
            let s1 = performance.now();
            totalLatency += (s1 - s0);

            const sim = cosineSimilarity(Array.from(out1.data), Array.from(out2.data));
            const dist = 1 - sim;
            const isMatch = pair.expected === 'match';
            const modelMatch = dist < m.threshold;

            if (isMatch && modelMatch) tp++;
            if (isMatch && !modelMatch) fn++;
            if (!isMatch && !modelMatch) tn++;
            if (!isMatch && modelMatch) fp++;
        }

        const metrics = computeMetrics(tp, fp, tn, fn);
        
        finalResults[m.name] = {
            precision: metrics.precision,
            recall: metrics.recall,
            f1: metrics.f1,
            false_merges: metrics.false_merges,
            false_splits: metrics.false_splits,
            average_latency_ms: (totalLatency / dataset.length).toFixed(2),
            cold_start_latency_ms: coldStart.toFixed(2),
            memory_growth_bytes: memGrowth
        };

        console.log(finalResults[m.name]);
    }

    const fs = await import('fs');
    fs.writeFileSync('C:\\Users\\master\\.gemini\\antigravity-ide\\brain\\4ad3f5a3-d555-481e-b66a-6bcf4dfe98b5\\PHASE_2_1_RESULTS.json', JSON.stringify(finalResults, null, 2));
    console.log('\nResults saved to PHASE_2_1_RESULTS.json');
}

main().catch(console.error);
