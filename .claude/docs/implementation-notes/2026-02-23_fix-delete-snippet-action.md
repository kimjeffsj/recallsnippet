# Implementation Note: Fix Snippet Deletion Action

## Context
When attempting to delete a snippet by pressing "Move to Trash" and confirming "Yes" in the warning dialog, no action occurred.

## Root Cause
A double-confirmation issue existed:
1. The `SnippetDetail` component correctly rendered a Shadcn `AlertDialog` that requires user confirmation.
2. Upon confirmation, `SnippetDetail` called the `onDelete` property, passing the snippet ID.
3. This handler in `HomePage.tsx` executed `deleteMutation` manually using the browser's native `window.confirm`.
4. The rapid firing of the native web alert immediately following the complex state unmount of a React UI portal caused an instant cancellation of the event loop, returning `false` on the native alert without user interaction.

## Resolution
Removed the `window.confirm` invocation from `HomePage.tsx`. Snippet deletion confirms are exclusively managed by the UI components (e.g. `SnippetDetail`). 

Since `window.confirm` was removed, we also cleaned up its related mocks in the test files (`HomePage.test.tsx`). The test suite passes fully off of the Shadcn component interaction.
