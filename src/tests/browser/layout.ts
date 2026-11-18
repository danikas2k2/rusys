import { afterEach, beforeEach, vi } from 'vitest';

import { commands, page } from 'vitest/browser';

declare module 'vitest/browser' {
    interface BrowserCommands {
        layoutWheel: (delta: number, position?: { x: number; y: number }) => Promise<void>;
        layoutTapButton: (name: string) => Promise<void>;
        layoutReducedMotion: (reducedMotion: 'reduce' | 'no-preference') => Promise<void>;
    }
}

export const viewportSelector = '.ui-AppShell-main [data-scrollarea-viewport]';

export function layoutCleanup() {
    let width: number;
    let height: number;

    beforeEach(() => {
        width = window.innerWidth;
        height = window.innerHeight;
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        document.querySelectorAll('[data-layout-style]').forEach((style) => style.remove());
        await commands.layoutReducedMotion('reduce');
        if (window.innerWidth !== width || window.innerHeight !== height) {
            await page.viewport(width, height);
        }
    });
}

export function element(selector: string, parent: ParentNode = document): HTMLElement {
    const match = parent.querySelector(selector);
    if (!(match instanceof HTMLElement)) {
        throw new Error(`Missing layout element: ${selector}`);
    }
    return match;
}

export function safeAreaInsets() {
    const style = document.createElement('style');
    style.dataset.layoutStyle = '';
    style.textContent =
        ':root { --safe-block-start: 59px; --safe-block-end: 34px; --safe-inline-start: 12px; --safe-inline-end: 12px; }';
    document.head.append(style);
}
