---
name: documentation
description:
    Write or update Markdown documentation for the RUSYS repository, including project guides and Mermaid diagrams. Use
    for documentation tasks in RUSYS; keep prose and diagram labels in English.
---

# RUSYS documentation

Use this skill when creating, revising, or reviewing Markdown documentation in the RUSYS repository.

- Write all Markdown prose, headings, tables, examples, and Mermaid labels in English. Translate any non-English content
  in a document you edit. Keep code identifiers, paths, commands, and user-facing strings that must match source code
  unchanged.
- Base behavior claims, commands, routes, data fields, and component relationships on the current repository. When
  documentation and implementation disagree, inspect the relevant code and update the documentation. Distinguish live
  behavior from historical examples or planned work.
- Keep the main guides organized by topic: `README.md` introduces the project and links to `docs/ARCHITECTURE.md`,
  `docs/DATA-AND-WORKFLOWS.md`, and `docs/DEVELOPMENT-AND-DEPLOYMENT.md`. Place Mermaid diagrams next to the
  explanations they support, rather than in a separate diagram catalog. Use focused component guides near their code
  when useful.
- Make diagrams accurate and readable: show significant components and direction of flow, identify logical relationships
  that are not database constraints, and explain important simplifications in nearby text.
- Update incoming and outgoing Markdown links when moving or renaming a document. Keep the README documentation links
  current.
- Format changed Markdown with the repository's Prettier configuration. For documentation-only edits, check links and
  formatting; run application tests only when the documentation change reveals a concrete implementation risk or the
  user asks for them.
