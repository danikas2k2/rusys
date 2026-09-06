import { createHash } from 'node:crypto';
import fs from 'node:fs';

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
        if (script.hasAttribute('src')) {
            continue;
        }

        const code = script.textContent ?? '';
        if (code.trim().length === 0) {
            continue;
        }

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
 * Client-build plugin:
 * - Reads the final generated index.html.
 * - Writes an nginx `set` directive containing CSP hashes for its inline scripts.
 * - Lets the client image own CSP, without coupling the server build to client output.
 */
export function writeNginxCspHashes(options: { input: string; output: string }): Plugin {
    return {
        name: 'write-nginx-csp-hashes',
        apply: 'build',
        enforce: 'post',
        closeBundle() {
            if (!fs.existsSync(options.input)) {
                this.error(`[csp] Missing generated client HTML at "${options.input}".`);
            }

            const hashes = computeInlineScriptSha256FromHtml(fs.readFileSync(options.input, 'utf8'));
            const sources = hashes.map((hash) => `'${hash}'`).join(' ');

            fs.writeFileSync(options.output, `set $csp_inline_script_hashes "${sources}";\n`);
            this.info(`[csp] wrote ${hashes.length} inline script hash(es) for nginx`);
        },
    };
}
