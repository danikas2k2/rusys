import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { JSDOM } from 'jsdom';
import type { Plugin } from 'vite';

function sha256Base64(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('base64');
}

function computeInlineScriptSha256FromHtml(html: string): string[] {
    const dom = new JSDOM(html);

    const hashes: string[] = [];
    const seen = new Set<string>();

    const scripts = dom.window.document.querySelectorAll('script');
    for (const script of scripts) {
        if (script.hasAttribute('src')) continue;

        const code = script.textContent ?? '';
        if (code.trim().length === 0) continue;

        // Hash MUST be computed from exact script text (no trimming), CSP is byte-exact.
        const hash = `sha256-${sha256Base64(code)}`;
        if (!seen.has(hash)) {
            seen.add(hash);
            hashes.push(hash);
        }
    }

    return hashes;
}

/**
 * Server-build plugin:
 * - Reads the already-built client `dist/public/index.html`
 * - Computes sha256 hashes for all inline scripts
 * - Replaces a placeholder marker in `src/server/helmetOptions.ts` during bundling
 *   so the final `dist/server.js` contains the hashes (no intermediate files).
 */
export function injectCspInlineScriptHashes(options: {
    input: string;
    output: string;
    placeholder: string | RegExp;
}): Plugin {
    let replacementArrayLiteral: string | undefined;

    return {
        name: 'inject-csp-inline-script-hashes',
        apply: 'build',
        enforce: 'pre',
        buildStart() {
            const indexPath = options.input;
            if (!fs.existsSync(indexPath)) {
                this.error(
                    `[csp] Missing "${indexPath}". Run the client build first (pnpm build:client) before building the server.`
                );
            }

            const html = fs.readFileSync(indexPath, 'utf8');
            const hashes = computeInlineScriptSha256FromHtml(html);

            // Helmet expects sources like "'sha256-...'" (single quotes inside the directive string).
            const helmetValues = hashes.map((h) => `'${h}'`);
            replacementArrayLiteral = JSON.stringify(helmetValues);

            this.info(`[csp] computed ${hashes.length} inline script hash(es) from ${path.basename(indexPath)}`);
        },
        transform(code, id) {
            // Vite sometimes appends query params; strip them for matching.
            const cleanId = id.split('?', 1)[0]!;
            if (!cleanId.endsWith(options.output)) return null;

            if (!code.match(options.placeholder)) {
                this.error(`[csp] Placeholder "${options.placeholder}" not found in ${cleanId}`);
            }

            if (replacementArrayLiteral) {
                return {
                    code: code.replace(options.placeholder, replacementArrayLiteral),
                    map: null,
                };
            }

            this.error('[csp] Internal error: replacement not computed');
        },
    };
}
