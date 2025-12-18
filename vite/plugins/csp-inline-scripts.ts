import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { JSDOM } from 'jsdom';
import type { Plugin } from 'vite';

export interface InlineScriptCspManifest {
    /**
     * Values are WITHOUT surrounding single-quotes, e.g. "sha256-abc...="
     * (helmet expects "'sha256-...'" strings in the CSP directive arrays).
     */
    scriptSrcElemSha256: string[];
    sourceHtml: string;
    generatedAt: string;
}

function sha256Base64(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('base64');
}

/**
 * Client-build plugin:
 * - Reads the FINAL emitted `index.html` from `outDir`
 * - Computes sha256 for all inline `<script>` (no `src`) with non-empty content
 * - Writes a manifest JSON into `outDir` so the server can pick it up for CSP.
 */
export function cspInlineScriptsManifest(options: { outDir: string; manifest: string }): Plugin {
    return {
        name: 'csp-inline-scripts-manifest',
        apply: 'build',
        async closeBundle() {
            const outDir = options.outDir;
            const indexHtml = path.resolve(outDir, 'index.html');

            if (!fs.existsSync(indexHtml)) {
                this.warn(`[csp] cannot find "${indexHtml}" to compute inline script hashes`);
                return;
            }

            const html = await fs.promises.readFile(indexHtml, 'utf8');
            const dom = new JSDOM(html);

            const hashes: string[] = [];
            const seen = new Set<string>();

            const scripts = dom.window.document.querySelectorAll('script');
            for (const script of scripts) {
                const hasSrc = script.hasAttribute('src');
                if (hasSrc) continue;

                const code = script.textContent ?? '';
                // Ignore scripts that are effectively empty.
                if (code.trim().length === 0) continue;

                // IMPORTANT: hash the exact text content (no trimming), since CSP hashes are byte-exact.
                const hash = `sha256-${sha256Base64(code)}`;
                if (!seen.has(hash)) {
                    seen.add(hash);
                    hashes.push(hash);
                }
            }

            const manifest: InlineScriptCspManifest = {
                scriptSrcElemSha256: hashes,
                sourceHtml: 'index.html',
                generatedAt: new Date().toISOString(),
            };

            const manifestPath = path.resolve(outDir, options.manifest);
            await fs.promises.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

            this.info(`[csp] wrote ${hashes.length} inline script hash(es) to "${manifestPath}"`);
        },
    };
}
