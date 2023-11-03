import { plugin } from '../plugin';
import { type WebpackModuleLoader } from '../types';

export async function getMdxLoader(isDevMode = false): Promise<WebpackModuleLoader> {
    return {
        loader: '@mdx-js/loader',
        options: {
            development: isDevMode,
            providerImportSource: '@mdx-js/react',
            remarkPlugins: [await plugin('remark-gfm'), await plugin('remark-rehype')],
            rehypePlugins: [await plugin('rehype-prism-plus')],
        },
    };
}
