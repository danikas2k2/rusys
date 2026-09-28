import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

async function optimizePwaAssets(): Promise<void> {
    const assetsDirectory = path.resolve(import.meta.dirname, '../public/assets');
    const files = (await fs.readdir(assetsDirectory)).filter((file) => file.endsWith('.png'));

    await Promise.all(
        files.map(async (file) => {
            const input = path.join(assetsDirectory, file);
            const temporary = `${input}.tmp`;
            await sharp(input).png({ adaptiveFiltering: true, compressionLevel: 9, effort: 10 }).toFile(temporary);
            await fs.rename(temporary, input);
        })
    );
}

void optimizePwaAssets().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
