<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Engineering Rules

## Execute the task
- When the user requests a code change, implement it. Do not stop after a plan or ask for a second confirmation for ordinary edits within the requested scope.
- Make a small, direct change consistent with nearby patterns. Preserve unrelated work and existing behavior unless the task requires changing it.
- Read only the files and documentation needed for this task. Respect project architecture, public APIs, data ownership, and server-side authorization. Do not introduce dependencies or broad refactors without need.
- Use strict TypeScript and existing project conventions. Prefer shared CSS classes or `data-*` selectors over inline styles.
- If something fails, diagnose it and attempt a focused repair rather than immediately stopping. Do not retry the same failed patch unchanged; re-read the file and use a smaller edit.

## Verify the change
- Before writing or changing tests, read and follow [src/tests/SPECS.md](src/tests/SPECS.md).
- Discover commands from the affected package. For code changes, run relevant focused lint, typecheck, and tests when available. Do not run the whole monorepo by default.
- For changed behavior, add or update meaningful regression tests where useful. Never weaken checks or tests to make a failure disappear.
- If a check fails due to the change, fix it and rerun affected checks. If a check is unavailable, expensive, or blocked, report that limitation honestly; it is not a reason to abandon an otherwise safe implementation.
- Review the final diff and any untracked files. Do not overwrite pre-existing user edits.

## Delegation and approvals
- The main Codex agent normally edits code directly. Do not delegate or run independent reviews unless the user asks or it would clearly improve the result. A failed or unavailable optional subagent must not block implementation.
- Treat the user's request as authorization for ordinary source, test, and configuration edits that are necessary to fulfill that request. Ask only before material out-of-scope changes or dangerous/irreversible actions (such as production deployment, destructive data operations, changing credentials, or publishing changes).
- Do not commit, push, merge, or deploy unless requested.

## Finish
- Continue until the requested change is implemented or a concrete technical/permission blocker is reached. Do not stop just because some files were modified or a first attempt failed.
- Briefly report what changed; list the checks actually run, their results, and any remaining failures or blocked checks. Never claim an unrun check passed.
