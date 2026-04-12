const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'server', '.env') });

const MEMORY_ROOT = path.join(__dirname, '..');
const KB_DIR = path.join(MEMORY_ROOT, 'knowledge_base');

// Initialize Gemini (or fallback)
const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error("[ERROR] GEMINI_API_KEY or OPENAI_API_KEY not found in server/.env");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

// Cosine similarity
function cosineSimilarity(A, B) {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < A.length; i++) {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Simple Native BM25 Implementation
class BM25 {
    constructor() {
        this.docs = [];
        this.docLengths = [];
        this.df = {}; // Document frequency
        this.N = 0;
        this.avgdl = 0;
        this.k1 = 1.2;
        this.b = 0.75;
    }

    tokenize(text) {
        return text.toLowerCase().match(/\b\w+\b/g) || [];
    }

    addDocument(text) {
        const tokens = this.tokenize(text);
        const tf = {};
        tokens.forEach(t => tf[t] = (tf[t] || 0) + 1);

        Object.keys(tf).forEach(t => {
            this.df[t] = (this.df[t] || 0) + 1;
        });

        this.docs.push({ tf, length: tokens.length });
        this.docLengths.push(tokens.length);
        this.N++;
    }

    updateIdf() {
        const totalLen = this.docLengths.reduce((a, b) => a + b, 0);
        this.avgdl = this.N > 0 ? totalLen / this.N : 0;
    }

    search(query) {
        const qTokens = this.tokenize(query);
        return this.docs.map((doc, idx) => {
            let score = 0;
            qTokens.forEach(q => {
                if (!this.df[q]) return;
                // IDF
                const idf = Math.log(1 + (this.N - this.df[q] + 0.5) / (this.df[q] + 0.5));
                // TF
                const tf = doc.tf[q] || 0;
                const numerator = tf * (this.k1 + 1);
                const denominator = tf + this.k1 * (1 - this.b + this.b * (doc.length / this.avgdl));
                score += idf * (numerator / denominator);
            });
            return { id: idx, score };
        });
    }
}

// Extract chunks from markdown files
function loadKnowledgeBase() {
    const chunks = [];
    if (!fs.existsSync(KB_DIR)) {
        fs.mkdirSync(KB_DIR, { recursive: true });
        return chunks;
    }
    const files = fs.readdirSync(KB_DIR);
    files.forEach(file => {
        if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(KB_DIR, file), 'utf-8');
            // Simplified chunking by paragraphs for demonstration
            content.split('\n\n').filter(c => c.trim().length > 20).forEach(text => {
                chunks.push({
                    file,
                    text: text.trim()
                });
            });
        }
    });
    return chunks;
}

async function getEmbedding(text) {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function hybridSearch(query, topK = 3) {
    console.log(`[SEARCH] Query: "${query}"`);
    console.log(`[INFO] Weighting: 0.7 Vector + 0.3 BM25`);

    const chunks = loadKnowledgeBase();
    if (chunks.length === 0) {
        console.log(`[SEARCH] Knowledge base is empty.`);
        return [];
    }

    // 1. Vector Search
    console.log(`[SEARCH] Getting embeddings...`);
    const queryEmbedding = await getEmbedding(query);

    // In production, embeddings should be cached. Getting them live for script:
    for (let c of chunks) {
        c.embedding = await getEmbedding(c.text);
        c.vectorScore = cosineSimilarity(queryEmbedding, c.embedding);
    }

    // 2. BM25 Search
    console.log(`[SEARCH] Calculating BM25 term frequencies...`);
    const bm25Engine = new BM25();
    chunks.forEach(c => bm25Engine.addDocument(c.text));
    bm25Engine.updateIdf();

    const bm25Results = bm25Engine.search(query);

    // Normalize BM25 scores (0 to 1 fallback)
    const maxBm25 = Math.max(...bm25Results.map(r => r.score), 1);
    chunks.forEach((c, idx) => {
        c.bm25Score = bm25Results[idx].score / maxBm25;
    });

    // 3. Hybrid Scoring (0.7 Vector + 0.3 BM25)
    chunks.forEach(c => c.finalScore = (0.7 * c.vectorScore) + (0.3 * c.bm25Score));

    // Sort and return topK
    chunks.sort((a, b) => b.finalScore - a.finalScore);
    const results = chunks.slice(0, Math.min(topK, chunks.length));

    console.log("\n[RESULTS] Top Matches:");
    results.forEach((r, i) => {
        console.log(`\n--- Match ${i + 1} (Hybrid: ${r.finalScore.toFixed(3)} | V: ${r.vectorScore.toFixed(3)} | BM25: ${r.bm25Score.toFixed(3)}) [${r.file}] ---`);
        console.log(r.text);
    });

    return results;
}

// Run if called directly
if (require.main === module) {
    const query = process.argv.slice(2).join(' ') || "What are the rules for ReMeLight?";
    hybridSearch(query).catch(console.error);
}

module.exports = { hybridSearch, BM25 };
