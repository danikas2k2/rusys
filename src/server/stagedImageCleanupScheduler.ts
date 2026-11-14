import path from 'node:path';

import { cleanupStagedImages } from '~/server/data/stagedImageCleanup';

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

/** Starts at boot and retries hourly; failures must not stop future cleanup attempts. */
export function startStagedImageCleanup(directory: string, onError: () => void): () => void {
    let running = false;
    let stopped = false;
    const run = async () => {
        if (running || stopped) {
            return;
        }
        running = true;
        try {
            await cleanupStagedImages(directory);
            await cleanupStagedImages(path.join(directory, '.claims'));
        } catch {
            onError();
        } finally {
            running = false;
        }
    };
    void run();
    const timer = setInterval(() => void run(), CLEANUP_INTERVAL_MS);
    timer.unref();
    return () => {
        stopped = true;
        clearInterval(timer);
    };
}
