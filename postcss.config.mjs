import postcssDiscardComments from 'postcss-discard-comments';
import postcssImport from 'postcss-import';
import postcssSimpleVars from 'postcss-simple-vars';
import postcssNested from 'postcss-nested';
import postcssPresetEnv from 'postcss-preset-env';
import relativeColorSyntax from '@csstools/postcss-relative-color-syntax';
import autoprefixer from 'autoprefixer';
import postcssPresetMantine from 'postcss-preset-mantine';
import postcssScss from 'postcss-scss';
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

// Minimal PostCSS 8-compatible stripper for inline (//) comments
const stripInlineComments = () => ({
    postcssPlugin: 'strip-inline-comments-inline',
    Once(root) {
        root.walkComments((comment) => {
            if (comment.raws.inline) {
                comment.remove();
            }
        });
    },
});
stripInlineComments.postcss = true;

export default {
    // Allow // comments via SCSS parser; also set parser explicitly for Vite/PostCSS
    syntax: postcssScss,
    parser: postcssScss,
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
        stripInlineComments(),
        postcssNested(),
        postcssPresetEnv({
            stage: 0,
            enableClientSidePolyfills: false,
            autoprefixer: false,
            features: {
                clamp: false,
                // 'custom-properties': { preserve: false },
                // 'color-mix': { preserve: false },
                // 'color-functional-notation': { preserve: false },
                'relative-color-syntax': false,
            },
        }),
        relativeColorSyntax({
            preserve: false,
        }),
        autoprefixer({
            overrideBrowserslist: ['defaults', 'not IE 11', 'not op_mini all'],
        }),
    ],
};
