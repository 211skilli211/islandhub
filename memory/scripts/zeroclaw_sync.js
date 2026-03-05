const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'server', '.env') });

const ZEROCLAW_URL = process.env.ZEROCLAW_GATEWAY_URL || 'http://localhost:3001';
const MEMORY_ROOT = path.join(__dirname, '..');
const MAIN_CONTEXT_PATH = path.join(MEMORY_ROOT, 'projects', 'main_context.md');

async function syncWithZeroClaw() {
    console.log(`=== ReMeLight: ZeroClaw Admin Sync ===`);

    // 1. Read Current Memory State
    if (!fs.existsSync(MAIN_CONTEXT_PATH)) {
        console.error("[ERROR] main_context.md not found. Run start_routine.js first.");
        return;
    }

    const contextContent = fs.readFileSync(MAIN_CONTEXT_PATH, 'utf-8');

    // 2. Prepare Sync Payload
    const payload = {
        action: 'sync_memory',
        source: 'remelight_architect',
        timestamp: new Date().toISOString(),
        context_size: contextContent.length,
        // In a real system, we'd send the actual parsed context or embeddings
        summary: contextContent.substring(0, 500) + '...'
    };

    console.log(`[SYNC] Pinging ZeroClaw Gateway at ${ZEROCLAW_URL}...`);

    try {
        // Attempt to sync (Graceful fallback if ZeroClaw isn't running)
        const response = await fetch(`${ZEROCLAW_URL}/api/admin/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`[SYNC] Success! ZeroClaw acknowledged memory state.`);
        } else {
            console.log(`[SYNC] ZeroClaw returned status: ${response.status}. It may be offline or lacking the /api/admin/sync route.`);
        }
    } catch (err) {
        console.log(`[SYNC] Could not reach ZeroClaw at ${ZEROCLAW_URL}. Ensure the service is running for full admin automation.`);
        console.log(`[INFO] (Expected if ZeroClaw is not currently booted).`);
    }
}

// Run if called directly
if (require.main === module) {
    syncWithZeroClaw().catch(console.error);
}

module.exports = { syncWithZeroClaw };
