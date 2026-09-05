const NUM_PERMUTATIONS = 128;

// A simple deterministic hash function (FNV-1a variant)
function fnv1a32(str: string, seed: number): number {
  let hval = 0x811c9dc5 ^ seed;
  for (let i = 0; i < str.length; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

// Generate 128 hash function seeds (deterministic)
const SEEDS = Array.from({ length: NUM_PERMUTATIONS }, (_, i) => fnv1a32(`seed-${i}`, 0));

export function compute_minhash_signature(text: string): number[] {
  // 1. Sanitize text and tokenize
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const tokens = cleanText.split(/\s+/).filter(t => t.length > 0);
  
  // 2. Generate 3-word shingles
  const shingles = new Set<string>();
  for (let i = 0; i < tokens.length - 2; i++) {
    shingles.add(`${tokens[i]} ${tokens[i+1]} ${tokens[i+2]}`);
  }
  
  // 3. Compute MinHash signature
  const signature = new Array(NUM_PERMUTATIONS).fill(Infinity);
  
  for (const shingle of shingles) {
    for (let i = 0; i < NUM_PERMUTATIONS; i++) {
      const hash = fnv1a32(shingle, SEEDS[i]);
      if (hash < signature[i]) {
        signature[i] = hash;
      }
    }
  }
  
  return signature;
}

export function calculate_jaccard_overlap(sigA: number[], sigB: number[]): number {
  if (!sigA || !sigB || sigA.length !== NUM_PERMUTATIONS || sigB.length !== NUM_PERMUTATIONS) {
    return 0;
  }
  
  let matches = 0;
  for (let i = 0; i < NUM_PERMUTATIONS; i++) {
    if (sigA[i] === sigB[i]) {
      matches++;
    }
  }
  
  return matches / NUM_PERMUTATIONS;
}

// In-memory wire index for LSH querying (in production, use DB)
export const wireIndex: { id: string, signature: number[] }[] = [];

export function add_to_wire_index(id: string, signature: number[]) {
  wireIndex.push({ id, signature });
}

export function query_lsh_wire_index(signature: number[]): number {
  let maxOverlap = 0;
  
  for (const wireArt of wireIndex) {
    const overlap = calculate_jaccard_overlap(signature, wireArt.signature);
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
    }
  }
  
  return maxOverlap;
}

const MEDIA_CONGLOMERATES: Record<string, string> = {
  "CNN-News18": "Network18 Group",
  "Firstpost": "Network18 Group",
  "Moneycontrol": "Network18 Group",
  "News18": "Network18 Group",
  "Times of India": "Times Group",
  "Economic Times": "Times Group",
  "Navbharat Times": "Times Group",
  "India Today": "India Today Group",
  "Aaj Tak": "India Today Group",
  "Business Today": "India Today Group",
  "NDTV": "Adani Media",
  "BQ Prime": "Adani Media",
  "The Hindu": "Independent Press",
  "The Indian Express": "Independent Press",
  "Scroll.in": "Independent Press",
  "The Wire": "Independent Press",
  "Newslaundry": "Independent Press",
  "PTI": "Wire Service",
  "ANI": "Wire Service",
  "IANS": "Wire Service",
  "Reuters": "Wire Service"
};

export function get_ownership_group(outletName: string): string {
    // Find matching conglomerate, or default to outlet name
    for (const [key, value] of Object.entries(MEDIA_CONGLOMERATES)) {
        if (outletName.toLowerCase().includes(key.toLowerCase())) {
            return value === "Independent Press" ? outletName : value;
        }
    }
    return outletName;
}
