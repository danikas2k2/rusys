---
name: code-with-review
description:
    Implement a software task using independent code, security, and accessibility reviews. Use for feature
    implementation, bug fixes and refactoring requiring validation.
---

# Code with Review Workflow

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

Delegate implementation to the `coder` subagent.

Wait for implementation to finish before reviewing the diff.

## Step 3 — Validate

Execute available project checks:

- TypeScript typecheck
- Lint
- Relevant unit and integration tests
- Build where applicable

Do not report skipped checks as passed.

## Step 4 — Independent Review

Delegate to `reviewer` for an independent code review, `auditor` for an independent security review, and `assessor` for
an independent accessibility review as separate subagents. Invoke `assessor` for every task; it should explain N/A when
the changes have no user-facing accessibility impact.

Supply the original specification, acceptance criteria, relevant architecture and accessibility documentation, actual
diff, and validation results.

Do not provide the coder's conclusions as evidence.

Run reviews in batches if the configured agent thread limit prevents all three from running together. Wait for all three
review results.

## Step 5 — Repair

For actionable BLOCKER or HIGH findings:

- Return the findings to `coder`.
- Apply targeted corrections.
- Run relevant validation again.
- Request independent re-review of the corrected changes from each reviewer whose findings were addressed.

Limit automatic repair to two iterations. Escalate unresolved findings to the user.

## Step 6 — Report

Summarize:

- Implemented requirements
- Validation results
- Review findings and their resolutions
- Remaining risks
- Any deviations from the specification

Never commit, push or merge without authorization. Never claim independent verification if delegation failed.
