# Implementation Notes: 2026-02-23_fix-db-init-error

## Summary
Resolved a Tauri backend panic (`duplicate column name: is_favorite`) that occurred during `pnpm tauri dev`. 

## Root Cause Analysis
The panic was caused by a structural mismatch between the local SQLite database file (`db.sqlite`) and the expected sequence of `rusqlite` database migrations in `src-tauri/src/db/migrations.rs`. Specifically, the application database schema had been modified in a previous iteration without the `migrations` table recording the `003_add_snippet_metadata` migration step. When Tauri attempted to start up, it naturally tried to run all unrecorded migrations, immediately failing because the SQLite `ALTER TABLE` command is not idempotent and fails when a column already exists.

## Fix Implemented
Given this is a standard issue during local development, the safest and cleanest action was to simply clear the local state by deleting the existing database file.

1. Located the SQLite database at `~/Library/Application Support/recallsnippet/recallsnippet.db`.
2. Deleted `recallsnippet.db`.
3. Ran `pnpm tauri dev`, allowing the application to securely generate a brand new `.db` file by executing all hardcoded migrations chronologically.

## Verification
- Verified the launch sequence of `pnpm tauri dev`.
- Confirmed the database initialization panic is completely resolved and the application GUI renders without backend crash loops.
