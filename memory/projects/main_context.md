# IslandHub Project Context

## Goal
Implement a hybrid memory system and scheduler for the live AI agent system to persist context across sessions, minimize token usage, and coordinate team workflows. Integrate this with ZeroClaw for automated admin controls across the dashboard.

## Constraints
- Must use structured file-based memory (ReMeLight logic).
- Must use mandatory markdown headers (Goal, Constraints, Progress, Key Decisions, Next Steps, Critical Context).
- Dense technical data must be stored in a SQLite database (not markdown context).
- Vector retrieval (0.7 Vector + 0.3 BM25) logic needed for semantic memory search.
- Must execute Start and Closing routines to manage context token limits.

## Progress
- [x] Connected agent system to live PostgreSQL backend (5 tables).
- [x] Implemented OpenRouter LLM integration with cost/token tracking.
- [x] Built frontend Agent Command Center UI (7 tabs).
- [x] Created `/memory` directory root and subfolders.
- [/] Initializing SQLite database for technical density.
- [ ] Setting up the Start/Closing routine scripts.
- [ ] Integrating vector embeddings for `knowledge_base`.

## Key Decisions
- Placed the memory root at `/memory` in the main workspace to keep it globally accessible to system routines.
- Separated standard chat persistence (which lives in PostgreSQL `agent_conversations`) from the overarching "System Architect" memory (which lives here in `/memory`).

## Next Steps
1. Initialize `technical_data.db` SQLite schema.
2. Structure the `compact_memory` Node.js script.
3. Establish the Vector search mechanism.
4. Integrate ZeroClaw for full dashboard automation.

## Critical Context
- The agent system is live. 
- API routes: `/api/agent/chat`, `/api/agent/configs`, `/api/agent/providers`, `/api/agent/settings`.
- Services: `server/src/services/llmService.ts`.
- The frontend Next.js server runs on port 3000, backend Node server on 5001.
