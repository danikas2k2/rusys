import postcssDiscardComments from 'postcss-discard-comments';
import postcssImport from 'postcss-import';
import postcssSimpleVars from 'postcss-simple-vars';
import postcssNested from 'postcss-nested';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import postcssPresetMantine from 'postcss-preset-mantine';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const alias = {
    '~': path.resolve(__dirname, './src'),
    '@tests': path.resolve(__dirname, './src/tests'),
};

const expr = new RegExp(`^(${Object.keys(alias).join('|')})/`);

export default {
    syntax: 'postcss-less',
    plugins: [
        // postcssImport must come FIRST to process @import statements before other plugins
        postcssImport({
            skipDuplicates: true,
            resolve(id, basedir) {
                if (id.startsWith('~') || id.startsWith('@')) {
                    const match = id.match(expr);
                    if (match) {
                        return `${alias[match[1]]}/${id.slice(match[0].length)}`;
                    }
                    try {
                        return require.resolve(id, { paths: [basedir] });
                    } catch {
                        // Ignore
                    }
                }
                return id;
            },
        }),
        postcssPresetMantine({
            features: {
                lightDarkFunction: false,
            },
        }),
        postcssSimpleVars({
            /*variables: {
                'mantine-breakpoint-xs': '36em',
                'mantine-breakpoint-sm': '48em',
                'mantine-breakpoint-md': '62em',
                'mantine-breakpoint-lg': '75em',
                'mantine-breakpoint-xl': '88em',
            },*/
        }),
        postcssDiscardComments({
            removeAll: true,
        }),
        postcssNested(),
        postcssPresetEnv({
            stage: 0,
            enableClientSidePolyfills: false,
            // Disable autoprefixing inside preset-env so we don't get legacy flex prefixes
            autoprefixer: false,
            features: {
                clamp: false,
                'custom-properties': false,
            },
        }),
        autoprefixer({
            overrideBrowserslist: ['defaults', 'not IE 11', 'not op_mini all'],
        }),
    ],
};
