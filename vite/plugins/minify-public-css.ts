import fs from 'node:fs';
import path from 'node:path';

import { transform } from 'lightningcss';
import type { Plugin } from 'vite';

/**
 * Vite copies files from `public/` unchanged. Minify selected public styles
 * after that copy, without making their source files hard to edit.
 */
export function minifyPublicCss(options: { outDir: string; file: string }): Plugin {
    return {
        name: 'minify-public-css',
        apply: 'build',
        closeBundle() {
            const filePath = path.resolve(options.outDir, options.file);
            if (!fs.existsSync(filePath)) {
                this.warn(`[minify-public-css] Stylesheet not found: ${filePath}`);
                return;
            }

            const source = fs.readFileSync(filePath);
            const minified = transform({
                filename: filePath,
                code: source,
                minify: true,
            });
            fs.writeFileSync(filePath, minified.code);
            this.info(`[minify-public-css] Written ${options.file} (${minified.code.length} bytes)`);
        },
    };
}
