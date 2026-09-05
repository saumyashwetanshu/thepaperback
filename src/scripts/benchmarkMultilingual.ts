import { pipeline } from '@xenova/transformers';

async function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function runBenchmark() {
  console.log('Loading English model (Xenova/all-MiniLM-L6-v2)...');
  const engExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  
  console.log('Loading Multilingual model (Xenova/paraphrase-multilingual-MiniLM-L12-v2)...');
  const multiExtractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

  const pairs = [
    {
      type: 'same-event-en-hi',
      text1: "Prime Minister inaugurated the new parliament building today in New Delhi.",
      text2: "प्रधानमंत्री ने आज नई दिल्ली में नए संसद भवन का उद्घाटन किया।"
    },
    {
      type: 'different-event-en-hi',
      text1: "The stock market crashed by 500 points on Monday.",
      text2: "प्रधानमंत्री ने आज नई दिल्ली में नए संसद भवन का उद्घाटन किया।"
    }
  ];

  for (const pair of pairs) {
    console.log(`\nTesting pair type: ${pair.type}`);
    console.log(`Text 1: ${pair.text1}`);
    console.log(`Text 2: ${pair.text2}`);

    const t0 = performance.now();
    const out1Eng = await engExtractor(pair.text1, { pooling: 'mean', normalize: true });
    const out2Eng = await engExtractor(pair.text2, { pooling: 'mean', normalize: true });
    const simEng = await cosineSimilarity(Array.from(out1Eng.data), Array.from(out2Eng.data));
    const t1 = performance.now();

    const t2 = performance.now();
    const out1Multi = await multiExtractor(pair.text1, { pooling: 'mean', normalize: true });
    const out2Multi = await multiExtractor(pair.text2, { pooling: 'mean', normalize: true });
    const simMulti = await cosineSimilarity(Array.from(out1Multi.data), Array.from(out2Multi.data));
    const t3 = performance.now();

    console.log(`English Model Similarity: ${simEng.toFixed(4)} (Latency: ${(t1 - t0).toFixed(2)}ms)`);
    console.log(`Multilingual Model Similarity: ${simMulti.toFixed(4)} (Latency: ${(t3 - t2).toFixed(2)}ms)`);
  }
}

runBenchmark().catch(console.error);
