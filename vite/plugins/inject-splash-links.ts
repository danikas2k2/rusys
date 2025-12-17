import fs from 'node:fs';
import path from 'node:path';

import { JSDOM } from 'jsdom';
import type { Plugin } from 'vite';

export interface InjectSplashLinksPluginOptions {
    /**
     * Absolute path to the project root (typically __dirname from vite config).
     */
    projectRoot: string;
    /**
     * Directory (relative to projectRoot) that is served as Vite public dir.
     */
    publicDir?: string;
}

function resolveFilePathWithinProject(projectRoot: string, maybePath: string): string | null {
    if (!maybePath) return null;
    // treat leading "/" as project-root relative, not filesystem-root
    const rel = maybePath.startsWith('/') ? maybePath.slice(1) : maybePath;
    const full = path.resolve(projectRoot, rel);
    const root = path.resolve(projectRoot);
    if (!full.startsWith(root + path.sep) && full !== root) return null;
    return full;
}

function injectTemplateAtNode(targetDom: JSDOM, targetNode: Node, template: HTMLTemplateElement): void {
    const doc = targetDom.window.document;
    const parent = targetNode.parentNode;
    if (!parent) return;

    const nodes = [...template.content.childNodes].map((n) => doc.importNode(n, true));
    for (const n of nodes) parent.insertBefore(n, targetNode);
    parent.removeChild(targetNode);
}

export function injectSplashLinksPlugin(options: InjectSplashLinksPluginOptions): Plugin {
    const publicDir = options.publicDir ?? 'public';

    return {
        name: 'inject-splash-links',
        enforce: 'pre',
        transformIndexHtml(html) {
            try {
                const dom = new JSDOM(html);
                const doc = dom.window.document;

                const placeholders = [...doc.querySelectorAll('template[slot][content]')] as HTMLTemplateElement[];
                for (const placeholder of placeholders) {
                    const slotId = placeholder.getAttribute('slot');
                    const contentPath = placeholder.getAttribute('content');
                    if (!slotId || !contentPath) continue;

                    const resolved = resolveFilePathWithinProject(options.projectRoot, contentPath);
                    if (!resolved || !fs.existsSync(resolved)) continue;

                    const splashHtml = fs.readFileSync(resolved, 'utf8');
                    const splashDom = new JSDOM(splashHtml);
                    const sourceEl = splashDom.window.document.getElementById(slotId);
                    if (!sourceEl) continue;
                    if (sourceEl.tagName.toLowerCase() !== 'template') continue;

                    injectTemplateAtNode(dom, placeholder, sourceEl as unknown as HTMLTemplateElement);
                }

                // Note: we do not use <slot> at all here, by design.
                return dom.serialize();
            } catch {
                // If anything goes wrong, leave html unchanged.
                return html;
            }
        },
    };
}
