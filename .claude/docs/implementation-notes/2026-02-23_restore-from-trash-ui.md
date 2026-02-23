# Implementation Note: Restore from Trash UI

## Context
A request was made to improve the intuitive nature of restoring snippets from the Trash view. Originally, users could only dig into individual snippets via `SnippetDetail` to hit a tiny refresh icon.

## Changes
1. **List View Quick-Restore**: Added a `handleRestoreFromList` function in `HomePage.tsx`, piped it through `SnippetList.tsx` and into `SnippetCard.tsx`.
2. **Card UI**: When `SnippetCard` detects it's showing a deleted snippet, it replaces the static Trash icon with a `lucide-react` `RefreshCw` button styled elegantly with a green tint and a hover state.
3. **Detail View Prominence**: Changed the tiny ghost button inside `SnippetDetail` to a clearly styled, labeled generic outline button that says "Restore Snippet", utilizing the `RefreshCw` icon for consistency.
4. **Test Adjustments**: Added tests to explicitly hit `restoreButton` inside `SnippetCard.test.tsx` and modified the query selector in `SnippetDetail.test.tsx` to look for the new button label.

No regressions found. All tests passed.
