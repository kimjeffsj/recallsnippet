# Implementation Note: Fix Warnings and Model Selection

## Date: 2026-02-24
## Phase: 3-4

### Changes Made

**Backend (Fixing Unused Warnings):**
- Removed unused `DEFAULT_EMBEDDING_MODEL` and unused `delete_embedding` function from `src-tauri/src/ai/embedding.rs`. Since snippets are synced via foreign keys, the `embeddings` table row drops automatically (`ON DELETE CASCADE`), making a manual function unnecessary.
- Removed unused `DEFAULT_OLLAMA_BASE_URL` from `src-tauri/src/ai/ollama.rs` and initialized it locally within module tests to clean up dead code.
- Addressed `dead_code` warning on `Database::new_in_memory()` by properly applying `#[allow(dead_code)]` in `db/connection.rs`.
- Cleaned up unused variables in test files.

**Frontend (Ollama Model Selection):**
- Updated `SettingsDialog.tsx` to explicitly notify users if models are missing from their local Ollama instance.
- Added a warning alert box with helpful `<code/>` tags instructing the user to run `ollama pull qwen2.5-coder:7b` and `nomic-embed-text`.
- Added a "Refresh Models" button to easily retry importing models after running the pull commands.
- Configured the `<Select/>` components for LLM and Embedding models to display "(Not installed)" for missing values gracefully, improving UX tracking.

### Tests
- Passed all 55 backend Rust tests (`cargo test`) and 0 `cargo clippy` warnings generated.
- Passed all 100 frontend TS tests (`pnpm test`).
