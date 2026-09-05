import time
import numpy as np
try:
    from sentence_transformers import SentenceTransformer
    from FlagEmbedding import FlagReranker
except ImportError:
    print("Please install requirements: pip install sentence-transformers FlagEmbedding")
    exit(1)

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def run_benchmark():
    print("Loading multilingual MiniLM...")
    start = time.time()
    embedder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    print(f"Loaded in {time.time() - start:.2f}s")

    print("\nLoading BGE Reranker...")
    start = time.time()
    reranker = FlagReranker('BAAI/bge-reranker-base', use_fp16=True)
    print(f"Loaded in {time.time() - start:.2f}s")

    claims = [
        "Narendra Modi resigned today.",
        "A massive earthquake hit Delhi."
    ]

    docs = [
        "Prime Minister Narendra Modi attended the summit in New Delhi.",
        "There are false rumors circulating about PM Modi resigning.",
        "Earthquake tremors were felt in Delhi NCR region.",
        "The weather in Delhi is sunny today."
    ]

    print("\n--- Embedding Benchmark ---")
    start = time.time()
    claim_embeddings = embedder.encode(claims)
    doc_embeddings = embedder.encode(docs)
    
    for i, claim in enumerate(claims):
        print(f"\nClaim: {claim}")
        scores = [cosine_similarity(claim_embeddings[i], doc_emb) for doc_emb in doc_embeddings]
        for j, score in enumerate(scores):
            print(f"  [{score:.3f}] {docs[j]}")
    print(f"Embedding completed in {time.time() - start:.2f}s")

    print("\n--- BGE Reranker Benchmark ---")
    start = time.time()
    for claim in claims:
        print(f"\nClaim: {claim}")
        pairs = [[claim, doc] for doc in docs]
        scores = reranker.compute_score(pairs)
        for j, score in enumerate(scores):
            print(f"  [{score:.3f}] {docs[j]}")
    print(f"Reranking completed in {time.time() - start:.2f}s")

if __name__ == "__main__":
    run_benchmark()
