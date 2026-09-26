import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export default async function globalTeardown() {
    await rm(path.resolve(process.cwd(), 'e2e/setup/.runtime.json'), { force: true });
    const file = path.resolve(process.cwd(), 'next-env.d.ts');
    const content = await readFile(file, 'utf8');
    if (content.includes('./.next-e2e/')) {
        await writeFile(file, content.replaceAll('./.next-e2e/', './.next/'));
    }
}
