const fs = require('fs');
const path = require('path');

const MEMORY_ROOT = path.join(__dirname, '..');
const PROJECTS_DIR = path.join(MEMORY_ROOT, 'projects');

// A simple size threshold (e.g., 50KB proxy for token limits)
const SIZE_THRESHOLD_BYTES = 50 * 1024;

async function summarizeContent(content) {
    // In a full implementation, this calls an LLM to generate a dense summary
    // retaining the mandatory ReMeLight headers.
    console.log("[COMPACTION] Calling summarize API (mock)...");
    return content.substring(0, 1000) + "\n\n... [CONTENT COMPACTED BY SYSTEM ROUTINE TO SAVE TOKENS] ...";
}

async function compactMemory() {
    console.log("=== ReMeLight Memory: COMPACT ROUTINE ===");

    if (!fs.existsSync(PROJECTS_DIR)) return;

    const files = fs.readdirSync(PROJECTS_DIR);
    let compactedCount = 0;

    for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(PROJECTS_DIR, file);
        const stats = fs.statSync(filePath);

        if (stats.size > SIZE_THRESHOLD_BYTES) {
            console.log(`[COMPACT] File ${file} exceeds threshold (${Math.round(stats.size / 1024)}KB). Compacting...`);

            const originalContent = fs.readFileSync(filePath, 'utf-8');
            const newContent = await summarizeContent(originalContent);

            // Backup original before overwriting
            fs.writeFileSync(`${filePath}.bak`, originalContent);
            fs.writeFileSync(filePath, newContent);

            compactedCount++;
        }
    }

    console.log(`[COMPACT] Routine finished. Compacted ${compactedCount} files.`);
}

// Allow running directly from CLI
if (require.main === module) {
    compactMemory().catch(console.error);
}

module.exports = { compactMemory };
