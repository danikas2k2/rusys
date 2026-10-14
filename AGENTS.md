<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Agent Engineering Rules

## General
- Follow the provided task specification and acceptance criteria.
- Keep changes within the authorized scope.
- Prefer simple solutions consistent with existing architecture.
- Do not invent undocumented APIs or requirements.
- Do not introduce unnecessary abstractions.

## Architecture
- Follow applicable decisions in docs/.
- Respect existing module and service boundaries.
- Do not change database schemas or public API contracts without authorization.
- Preserve tenant isolation and authorization boundaries.

## Security
- Validate untrusted input at system boundaries.
- Enforce authorization on server-side operations.
- Never expose credentials or sensitive data.
- Never disable security controls to resolve errors.

## Code Quality
- Use strict TypeScript.
- Avoid `any` unless justified.
- Handle failures explicitly.
- Prefer existing project patterns.
- Use a shared class or data-* selector for styling instead of inline styles.
- Avoid unrelated refactoring and dependencies.

## Testing
- Add regression tests for changed behavior.
- Include negative and boundary cases where applicable.
- Never delete or weaken tests merely to make them pass.
- Run available typecheck, lint and relevant tests.
- Report any checks that could not be executed.

## Protected Changes
Require explicit human approval before:
- Modifying CI workflows or security configuration
- Changing authentication or authorization architecture
- Adding production dependencies
- Changing public API contracts
- Making database schema migrations
- Modifying agent instructions or validation rules

## Completion
An implementation is not considered verified until:
- Relevant automated checks have passed
- An independent review has been completed
- Critical findings have been addressed
- Human approval has been obtained when required
