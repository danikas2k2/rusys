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

function splitAtCommaOrParen(char, str) {
    let i = 0;
    let depth = 0;
    while (i < str.length && (str[i] !== char || depth)) {
        if (str[i] === '(') depth++;
        if (str[i] === ')') depth--;
        i++;
    }
    return [str.slice(0, i), str.slice(i + 1)];
}

function parseLightDark(value) {
    const fn = 'light-dark(';
    const idx = value.indexOf(fn);
    if (idx === -1) return { light: value, dark: value };
    const prefix = value.slice(0, idx);
    const rest = value.slice(idx + fn.length);
    const [args, suffix] = splitAtCommaOrParen(')', rest);
    const [lightRaw, darkRaw] = splitAtCommaOrParen(',', args);
    const light = prefix + parseLightDark(lightRaw.trim()).light + parseLightDark(suffix).light;
    const dark = prefix + parseLightDark(darkRaw.trim()).dark + parseLightDark(suffix).dark;
    return { light, dark };
}

const SUPPORTS_LIGHT_DARK = '(color: light-dark(white, black))';

const lightDarkFallback = () => ({
    postcssPlugin: 'light-dark-fallback',
    OnceExit(root, { postcss }) {
        const rules = [];
        root.walkRules((rule) => {
            let node = rule.parent;
            while (node) {
                if (node.type === 'atrule' && node.name === 'supports' && node.params.includes('light-dark')) return;
                node = node.parent;
            }
            rules.push(rule);
        });
        for (const rule of rules) {
            const entries = [];
            rule.walkDecls((decl) => {
                if (!/\blight-dark\s*\(/.test(decl.value)) return;
                entries.push({ decl, ...parseLightDark(decl.value) });
            });
            if (!entries.length) continue;

            for (const { decl } of entries) decl.remove();

            const supportsRule = rule.clone({ nodes: [] });
            const supportsNotLightRule = rule.clone({ nodes: [] });
            const supportsNotDarkRule = rule.clone({ nodes: [] });
            for (const { decl, light, dark } of entries) {
                supportsRule.append(decl.clone());
                supportsNotLightRule.append(postcss.decl({ prop: decl.prop, value: light, important: decl.important }));
                if (light !== dark) {
                    supportsNotDarkRule.append(postcss.decl({ prop: decl.prop, value: dark, important: decl.important }));
                }
            }

            const supports = postcss.atRule({ name: 'supports', params: SUPPORTS_LIGHT_DARK });
            supports.append(supportsRule);

            const lightMedia = postcss.atRule({ name: 'media', params: '(prefers-color-scheme: light)' });
            lightMedia.append(supportsNotLightRule);
            const supportsNot = postcss.atRule({ name: 'supports', params: `not ${SUPPORTS_LIGHT_DARK}` });
            supportsNot.append(lightMedia);
            if (supportsNotDarkRule.nodes.length) {
                const darkMedia = postcss.atRule({ name: 'media', params: '(prefers-color-scheme: dark)' });
                darkMedia.append(supportsNotDarkRule);
                supportsNot.append(darkMedia);
            }

            rule.parent.insertAfter(rule, supports);
            supports.parent.insertAfter(supports, supportsNot);
        }
    },
});
lightDarkFallback.postcss = true;

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
        lightDarkFallback(),
        postcssPresetEnv({
            stage: 0,
            enableClientSidePolyfills: false,
            autoprefixer: false,
            features: {
                clamp: false,
                // 'custom-properties': { preserve: false },
                // 'color-mix': { preserve: false },
                // 'color-functional-notation': { preserve: false },
                'light-dark-function': false,
                // 'relative-color-syntax': false,
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
