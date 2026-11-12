<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Agent Engineering Rules

## General and architecture
- Follow task requirements; make minimal changes consistent with nearby patterns and applicable `docs/` decisions. Avoid invented APIs, unrelated refactoring, dependencies, and unnecessary abstractions.
- Preserve existing uncommitted work, service boundaries, public contracts, database schemas, and tenant isolation unless explicitly authorized.
- Validate untrusted input; authorize server-side operations; never leak secrets or bypass security controls.
- Use strict TypeScript, avoid unjustified `any`, handle errors explicitly. Prefer shared classes or `data-*` selectors over inline styles.

## Validation — always applies, even without a Skill
- Discover **actual** commands from the affected package and applicable nested instructions; do not assume scripts or working directory.
- After executable code or behavior-affecting config changes, run **relevant targeted** lint, typecheck and affected tests. Do not run the entire monorepo by default; broaden to integration/e2e/build/dependents when impact warrants it. Docs-only edits may skip inapplicable checks with a reason.
- Add/update meaningful regression tests for behavioral changes when feasible, including important negative and edge cases. Run coverage only if it is a required gate or materially relevant; never weaken tests, lint, typecheck, coverage rules or security settings to make checks pass.
- On failure, diagnose, repair introduced issues and rerun impacted checks. Distinguish pre-existing failures only with evidence. If a required check is skipped, blocked or too expensive, state what remains unverified.
- Inspect final staged, unstaged and untracked changes; after the **last edit**, rerun checks invalidated by that edit. Avoid rerunning passing expensive checks when relevant inputs are unchanged.

## Risk-based review
- Main agent normally edits directly. No subagents for trivial/low-risk work; delegate `coder` only for a substantial isolated workstream.
- For high-risk work (auth/tenant boundaries, secrets, money, migrations, concurrency, breaking contracts, complex cross-package behavior), require independent `reviewer` review; add `auditor` only for security-sensitive changes and `assessor` only for accessibility-relevant UI changes. Standard-risk review is optional. Never spawn an agent just to say N/A.
- If a required review cannot run, report PARTIAL rather than claiming independent verification. `$code-with-review` describes the optional detailed workflow.

## Protected changes — obtain explicit user authorization *before* editing
- CI workflows, security configuration, authentication/authorization architecture.
- Production dependencies, public API contracts, database migrations.
- Agent instructions, validation rules or quality gates.

## Completion
- **PASS:** all applicable required checks passed on the final state, required reviews completed, no unresolved blocking defects, approvals obtained.
- **PARTIAL:** required check/review could not run or protected change awaits approval; clearly describe the gap.
- **FAIL:** relevant check still fails or a blocking defect remains; distinguish evidenced baseline failures.
- Report what changed, exact checks run/results, material skips and review findings; never claim an unrun test passed. Never commit, push or merge without authorization.

## Repository-specific validation commands
- Discover commands from package scripts. Add focused and broad variants here once verified; never invent them.
