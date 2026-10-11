Generate commit messages in English using exactly this structure:

<issue> (<type>): <short summary>

- <change detail 1>
- <change detail 2>

Rules:

- Output only the commit message, without Markdown code fences.
- Separate the subject and bullet list with one blank line.
- Use as many bullets as needed; keep them concise.
- Do not add section headings or Git comment markers.
- The issue number MUST come exclusively from the current Git branch name.
- Extract it using the pattern ^(\d+)-.
- Example: `257-lazy-load-product-images` MUST produce `#257`.
- Never infer the issue number from the diff, commit history, examples, or other issues.
- If the current branch name is not provided in your context, drop the <issue> part.
- Describe only changes supported by the diff.
- Do not claim that tests passed unless their execution is confirmed.
