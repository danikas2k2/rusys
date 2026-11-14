import fs from 'node:fs/promises';
import path from 'node:path';

/** Maximum age of an unclaimed upload. */
export const STAGED_IMAGE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

/** Remove expired staged uploads without following links or deleting unrelated files. */
export async function cleanupStagedImages(directory: string, now = Date.now()): Promise<void> {
    let entries;
    try {
        entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return;
        }
        throw error;
    }
    for (const entry of entries) {
        if (!entry.isFile() || !/^[a-f0-9]{64}$/.test(entry.name)) {
            continue;
        }
        const filename = path.join(directory, entry.name);
        try {
            const stat = await fs.lstat(filename);
            if (stat.isFile() && stat.mtimeMs <= now - STAGED_IMAGE_MAX_AGE_MS) {
                await fs.unlink(filename);
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }
}
