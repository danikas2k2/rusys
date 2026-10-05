import type { Page } from '@playwright/test';

// Keep the upload pending at a known byte count so screenshots capture the in-flight bar.
export async function holdUploadProgress(page: Page, path: string): Promise<void> {
    await page.addInitScript((targetPath) => {
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

        XMLHttpRequest.prototype.send = function (...args) {
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
    }, path);
}
