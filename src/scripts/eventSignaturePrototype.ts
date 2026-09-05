// Event Signature Design / Prototype
// This demonstrates how a composite signature can distinguish event identity 
// before modifying actual clustering logic.

type EventSignature = {
  entities: string[];
  predicate: string;
  object: string;
  temporal: string;
  location: string;
  numerics: number[];
};

function hashEventSignature(sig: EventSignature): string {
  // A naive structural hash to demonstrate how identical signatures map to the same event
  const key = [
    sig.entities.sort().join(','),
    sig.predicate,
    sig.object,
    sig.temporal,
    sig.location,
    sig.numerics.sort().join(',')
  ].join('|');
  
  // Return a pseudo-hash for demonstration
  return key.toLowerCase().replace(/\s+/g, '_');
}

function computeSignatureOverlap(sigA: EventSignature, sigB: EventSignature): number {
  let score = 0;
  let maxScore = 5;

  // 1. Entities overlap (Jaccard)
  const setA = new Set(sigA.entities.map(e => e.toLowerCase()));
  const setB = new Set(sigB.entities.map(e => e.toLowerCase()));
  let intersection = 0;
  for (const a of setA) if (setB.has(a)) intersection++;
  const union = setA.size + setB.size - intersection;
  const entitySim = union === 0 ? 0 : intersection / union;
  score += entitySim;

  // 2. Predicate Match
  if (sigA.predicate.toLowerCase() === sigB.predicate.toLowerCase()) score += 1;

  // 3. Location Match
  if (sigA.location.toLowerCase() === sigB.location.toLowerCase()) score += 1;

  // 4. Temporal Match
  if (sigA.temporal === sigB.temporal) score += 1;

  // 5. Numerics Match (e.g. fatalities, election numbers)
  if (sigA.numerics.length > 0 && sigB.numerics.length > 0) {
    const numA = new Set(sigA.numerics);
    const numB = new Set(sigB.numerics);
    let numInter = 0;
    for (const a of numA) if (numB.has(a)) numInter++;
    if (numInter > 0) score += 1;
  } else {
    maxScore -= 1; // If no numerics to compare, reduce max score
  }

  return score / maxScore;
}

function runPrototype() {
  console.log("--- EVENT SIGNATURE PROTOTYPE ---");
  
  const event1: EventSignature = {
    entities: ["Narendra Modi", "Parliament"],
    predicate: "inaugurated",
    object: "building",
    temporal: "2023-05-28",
    location: "New Delhi",
    numerics: []
  };

  const event2: EventSignature = {
    entities: ["Narendra Modi", "Parliament", "Sengol"],
    predicate: "inaugurated",
    object: "new parliament complex",
    temporal: "2023-05-28",
    location: "New Delhi",
    numerics: [75]
  };

  const event3: EventSignature = {
    entities: ["Narendra Modi", "Election Rally"],
    predicate: "addressed",
    object: "crowd",
    temporal: "2023-05-29",
    location: "Mumbai",
    numerics: [50000]
  };

  console.log("Event 1 Hash:", hashEventSignature(event1));
  console.log("Event 2 Hash:", hashEventSignature(event2));
  console.log("Event 3 Hash:", hashEventSignature(event3));

  console.log("\nSimilarity 1 vs 2:", computeSignatureOverlap(event1, event2).toFixed(2));
  console.log("Similarity 1 vs 3:", computeSignatureOverlap(event1, event3).toFixed(2));

  console.log("\nConclusion: Event 1 and 2 represent the same event (high overlap). Event 3 is distinct.");
}

runPrototype();
