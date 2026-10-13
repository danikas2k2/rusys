---
name: verified-implementation
description:
    Implement a software task using an independent code reviewer and security reviewer. Use for feature implementation,
    bug fixes and refactoring requiring validation.
---

# Verified Implementation Workflow

## Step 1 — Understand

Read AGENTS.md, the task specification, acceptance criteria and relevant architecture decisions.

Record:

- Required behavior
- Authorized scope
- Non-goals
- Risks
- Relevant validation commands

If requirements conflict, report the conflict before making an irreversible or high-risk change.

## Step 2 — Implement

Delegate implementation to the `implementer` subagent.

Wait for implementation to finish before reviewing the diff.

## Step 3 — Validate

Execute available project checks:

- TypeScript typecheck
- Lint
- Relevant unit and integration tests
- Build where applicable

Do not report skipped checks as passed.

## Step 4 — Independent Review

Delegate to `reviewer` and `security_reviewer` as separate subagents.

Supply the original specification, acceptance criteria, architecture documentation and actual diff.

Do not provide the implementer's conclusions as evidence.

Wait for both review results.

## Step 5 — Repair

For actionable BLOCKER or HIGH findings:

- Return the findings to `implementer`.
- Apply targeted corrections.
- Run relevant validation again.
- Request independent re-review of the corrected changes.

Limit automatic repair to two iterations. Escalate unresolved findings to the user.

## Step 6 — Report

Summarize:

- Implemented requirements
- Validation results
- Review findings and their resolutions
- Remaining risks
- Any deviations from the specification

Never commit, push or merge without authorization. Never claim independent verification if delegation failed.
