import React from 'react';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { NextApp } from '~/components/app/NextApp';
import type { Scenario } from '~/tests/fixtures/data';
import { getVisualAppData } from '~/tests/fixtures/visualData';

import '@fontsource-variable/noto-sans/wght.css';
import '@fontsource-variable/noto-sans-display/wght.css';
import '@fontsource-variable/noto-sans-mono/wght.css';
import '~/app/globals.css';
import '~/tests/visual.css';
import './visual-fonts.css';

export async function renderVisualApp(pathname: string, scenario: Scenario = 'basic') {
    window.history.replaceState({}, '', pathname);
    document.documentElement.lang = 'lt';
    const { data, resource, initialGroup } = getVisualAppData(pathname, scenario);
    await render(<NextApp initialData={data} initialResource={resource} initialGroup={initialGroup} locale="lt-LT" />);
    await document.fonts.ready;
    return page;
}

export async function settleVisual(): Promise<void> {
    await document.fonts.ready;
    await Promise.all(
        Array.from(document.images, async (image) => {
            if (!image.complete) {
                await image.decode();
            }
        })
    );

    const started = performance.now();
    let stableFrames = 0;
    while (stableFrames < 3) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const active = document.getAnimations().some((animation) => animation.playState === 'running');
        stableFrames = active ? 0 : stableFrames + 1;
        if (performance.now() - started > 2_000) {
            throw new Error('Visual content did not settle within 2 seconds');
        }
    }
}

export function css(selector: string, parent?: { element: () => Element }) {
    const element = (parent?.element() ?? document).querySelector(selector);
    if (!element) {
        throw new Error(`Element ${selector} not found`);
    }
    return page.elementLocator(element);
}

export function productTile(name: string) {
    const tile = Array.from(document.querySelectorAll('[data-tile-kind="product"]')).find((element) =>
        element.textContent?.includes(name)
    );
    if (!tile) {
        throw new Error(`Product tile ${name} not found`);
    }
    return page.elementLocator(tile);
}

export async function openProduct(name: string) {
    await productTile(name).click();
    return page.getByRole('dialog', { name: new RegExp(`${name} Uogienės`) });
}

export function clickMenuButton(): void {
    const button = document.querySelector<HTMLButtonElement>('button[aria-label="Meniu"]');
    if (!button) {
        throw new Error('Menu button not found');
    }
    button.click();
}

export async function uploadImage(
    selector: string,
    filename: 'uogienes.png' | 'avietes.png',
    parent?: { element: () => Element }
) {
    const response = await fetch(`/images/${filename}`);
    if (!response.ok) {
        throw new Error(`Fixture image ${filename} could not be loaded`);
    }
    const file = new File([await response.blob()], filename, { type: 'image/png' });
    await css(selector, parent).upload(file);
}

export function holdUploadProgress(targetPath: string): void {
    const uploading = new WeakSet<XMLHttpRequest>();
    const open = XMLHttpRequest.prototype.open;
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (
        ...args: [
            method: string,
            url: string | URL,
            async?: boolean,
            username?: string | null,
            password?: string | null,
        ]
    ) {
        if (String(args[1]).includes(targetPath)) {
            uploading.add(this);
        }
        return Reflect.apply(open, this, args);
    };
    XMLHttpRequest.prototype.send = function (...args: Parameters<XMLHttpRequest['send']>) {
        if (uploading.has(this)) {
            queueMicrotask(() =>
                this.upload.dispatchEvent(
                    new ProgressEvent('progress', { lengthComputable: true, loaded: 42, total: 100 })
                )
            );
            return;
        }
        return Reflect.apply(send, this, args);
    };
}
