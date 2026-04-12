const fs = require('fs');
const path = require('path');

const MEMORY_ROOT = path.join(__dirname, '..');
const TOOL_RESULT_DIR = path.join(MEMORY_ROOT, 'tool_result');
const EXPIRATION_HOURS = 24;

console.log("=== ReMeLight Memory: START ROUTINE ===");

// 1. Clean up expired tool result files
if (fs.existsSync(TOOL_RESULT_DIR)) {
    const now = Date.now();
    const files = fs.readdirSync(TOOL_RESULT_DIR);
    let deletedCount = 0;

    files.forEach(file => {
        const filePath = path.join(TOOL_RESULT_DIR, file);
        const stats = fs.statSync(filePath);

        // Check if file is older than EXPIRATION_HOURS
        const hoursOld = (now - stats.mtimeMs) / (1000 * 60 * 60);
        if (hoursOld > EXPIRATION_HOURS) {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`[CLEANUP] Deleted expired tool result: ${file}`);
        }
    });
    console.log(`[CLEANUP] Completed. Deleted ${deletedCount} expired files.`);
} else {
    fs.mkdirSync(TOOL_RESULT_DIR, { recursive: true });
}

// 2. Load and display current Project Context state (mocking read)
const mainContextPath = path.join(MEMORY_ROOT, 'projects', 'main_context.md');
if (fs.existsSync(mainContextPath)) {
    console.log(`[CONTEXT] Located main context at memory/projects/main_context.md`);
    // Future implementation: Load embedding cache into memory here.
    console.log(`[STARTUP] System Ready. Awaiting session input.`);
} else {
    console.error(`[ERROR] main_context.md missing! ReMeLight architecture requires it.`);
}
