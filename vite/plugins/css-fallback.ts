import fs from 'node:fs';
import path from 'node:path';

import postcss from 'postcss';
import type { PluginContext } from 'rollup';
import type { ModuleNode, Plugin, ViteDevServer } from 'vite';

interface Hsl {
    h: number;
    s: number;
    l: number;
}

const SUPPORTS_RELATIVE_COLOR = '(background: hsl(from red h s l))';
const SUPPORTS_LIGHT_DARK = '(color: light-dark(white, black))';
const RE_VARIABLE = /var\((--[\w-]+)(?:\s*,\s*([^()]+))?\)/g;
const RE_RELATIVE_HSL = /^hsl\(from\s+(#[\da-f]{3,8})\s+h\s+calc\(s\s*\*\s*([\d.]+)\)\s+calc\(l\s*\*\s*([\d.]+)\)\)$/i;
const RE_RELATIVE_ALPHA = /^color\(from\s+(#[\da-f]{3,8})\s+srgb\s+r\s+g\s+b\s*\/\s*([\d.]+)%\)$/i;
const RE_COLOR_MIX =
    /^color-mix\(in\s+(hsl|srgb),\s*(#[\da-f]{3,8})(?:\s+([\d.]+)%)?\s*,\s*(#[\da-f]{3,8})(?:\s+([\d.]+)%)?\)$/i;

function hexToHsl(value: string): Hsl | null {
    const hex = value.slice(1);
    const normalized = hex.length === 3 || hex.length === 4 ? [...hex].map((part) => part + part).join('') : hex;
    if (normalized.length !== 6 && normalized.length !== 8) {
        return null;
    }

    const [r, g, b] = [0, 2, 4].map((offset) => parseInt(normalized.slice(offset, offset + 2), 16) / 255);
    return rgbToHsl(r, g, b);
}

function hslToHex({ h, s, l }: Hsl, alpha?: number): string {
    const toHex = (value: number) =>
        Math.round(value * 255)
            .toString(16)
            .padStart(2, '0');
    const hex = `#${hslToRgb({ h, s, l }).map(toHex).join('')}`;
    return alpha === undefined ? hex : `${hex}${toHex(alpha)}`;
}

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
    const a = s * Math.min(l, 1 - l);
    const channel = (n: number) => {
        const k = (n + h / 30) % 12;
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [channel(0), channel(8), channel(4)];
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) {
        return { h: 0, s: 0, l };
    }
    const delta = max - min;
    const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    const h = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    return { h: h * 60, s, l };
}

function mixColors(space: string, first: Hsl, firstWeight: number, second: Hsl, secondWeight: number): string {
    const ratio = secondWeight / (firstWeight + secondWeight);
    if (space === 'hsl') {
        let hueDistance = second.h - first.h;
        if (hueDistance > 180) {
            hueDistance -= 360;
        } else if (hueDistance < -180) {
            hueDistance += 360;
        }
        return hslToHex({
            h: (first.h + hueDistance * ratio + 360) % 360,
            s: first.s + (second.s - first.s) * ratio,
            l: first.l + (second.l - first.l) * ratio,
        });
    }
    const [firstRed, firstGreen, firstBlue] = hslToRgb(first);
    const [secondRed, secondGreen, secondBlue] = hslToRgb(second);
    return hslToHex(
        rgbToHsl(
            firstRed + (secondRed - firstRed) * ratio,
            firstGreen + (secondGreen - firstGreen) * ratio,
            firstBlue + (secondBlue - firstBlue) * ratio
        )
    );
}

function splitAtCommaOrParen(char: string, value: string): [string, string] {
    let index = 0;
    let depth = 0;
    while (index < value.length && (value[index] !== char || depth)) {
        if (value[index] === '(') {
            depth++;
        } else if (value[index] === ')') {
            depth--;
        }
        index++;
    }
    return [value.slice(0, index), value.slice(index + 1)];
}

function parseLightDark(value: string): { light: string; dark: string } {
    const prefixIndex = value.indexOf('light-dark(');
    if (prefixIndex === -1) {
        return { light: value, dark: value };
    }
    const prefix = value.slice(0, prefixIndex);
    const rest = value.slice(prefixIndex + 'light-dark('.length);
    const [argumentsValue, suffix] = splitAtCommaOrParen(')', rest);
    const [lightValue, darkValue] = splitAtCommaOrParen(',', argumentsValue);
    const suffixValues = parseLightDark(suffix);
    return {
        light: prefix + parseLightDark(lightValue.trim()).light + suffixValues.light,
        dark: prefix + parseLightDark(darkValue.trim()).dark + suffixValues.dark,
    };
}

function hasSupportsCondition(params: string, condition: string): boolean {
    return params.replaceAll(/\s+/g, '') === condition.replaceAll(/\s+/g, '');
}

interface ColorSchemeRule {
    rule: postcss.Rule;
    light: postcss.Declaration[];
    dark: postcss.Declaration[];
}

function appendColorSchemeRules(supports: postcss.AtRule, rules: ColorSchemeRule[], pc: typeof postcss): void {
    for (const { rule, light, dark } of rules) {
        const lightMedia = pc.atRule({ name: 'media', params: '(prefers-color-scheme: light)' });
        lightMedia.append(rule.clone({ nodes: light }));
        supports.append(lightMedia);
        if (dark.some((decl, index) => decl.value !== light[index]?.value)) {
            const darkMedia = pc.atRule({ name: 'media', params: '(prefers-color-scheme: dark)' });
            darkMedia.append(rule.clone({ nodes: dark }));
            supports.append(darkMedia);
        }
    }
}

/**
 * Uses the final, import-expanded stylesheet as the source of truth. This keeps
 * the fallback in sync with package CSS and local theme variables automatically.
 */
function createValueResolver(root: postcss.Root): (value: string) => string | null {
    const variables = new Map<string, string>();
    root.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
            variables.set(decl.prop, decl.value);
        }
    });

    const resolveVariable = (name: string, visited: Set<string>): string | null => {
        if (visited.has(name)) {
            return null;
        }
        const value = variables.get(name);
        if (!value) {
            return null;
        }
        return resolve(value, new Set([...visited, name]));
    };

    const resolve = (value: string, visited = new Set<string>()): string | null => {
        let resolved = value.trim().replace(RE_VARIABLE, (_match, name: string, fallback?: string) => {
            return resolveVariable(name, visited) ?? fallback?.trim() ?? _match;
        });
        if (resolved.includes('var(')) {
            return null;
        }

        for (let iteration = 0; iteration < 3; iteration++) {
            const colorMix = resolved.match(RE_COLOR_MIX);
            if (colorMix) {
                const first = hexToHsl(colorMix[2]!);
                const second = hexToHsl(colorMix[4]!);
                if (!first || !second) {
                    return null;
                }
                resolved = mixColors(
                    colorMix[1]!.toLowerCase(),
                    first,
                    parseFloat(colorMix[3] ?? '50'),
                    second,
                    parseFloat(colorMix[5] ?? '50')
                );
            }

            const relativeHsl = resolved.match(RE_RELATIVE_HSL);
            if (relativeHsl) {
                const base = hexToHsl(relativeHsl[1]!);
                if (!base) {
                    return null;
                }
                resolved = hslToHex({
                    h: base.h,
                    s: Math.min(1, base.s * parseFloat(relativeHsl[2]!)),
                    l: Math.min(1, base.l * parseFloat(relativeHsl[3]!)),
                });
            }

            const relativeAlpha = resolved.match(RE_RELATIVE_ALPHA);
            if (relativeAlpha) {
                const base = hexToHsl(relativeAlpha[1]!);
                if (!base) {
                    return null;
                }
                resolved = hslToHex(base, parseFloat(relativeAlpha[2]!) / 100);
            }
        }
        return resolved;
    };

    return resolve;
}

// Keep the modern declarations in a feature query. buildFallback below produces
// the inverse branch after all imports have been expanded by postcss-import.
export const relativeColorFallback = (): postcss.Plugin => ({
    postcssPlugin: 'relative-color-fallback',
    OnceExit(root, { postcss: pc }) {
        const rules: postcss.Rule[] = [];
        root.walkRules((rule) => {
            let parent: postcss.Container | postcss.Document | undefined = rule.parent;
            while (parent) {
                if (parent.type === 'atrule' && (parent as postcss.AtRule).name === 'supports') {
                    return;
                }
                parent = parent.parent;
            }
            rules.push(rule);
        });

        for (const rule of rules) {
            const declarations = rule.nodes?.filter(
                (node): node is postcss.Declaration =>
                    node.type === 'decl' && (/^hsl\(from\s/.test(node.value) || /^color\(from\s/.test(node.value))
            );
            if (!declarations?.length) {
                continue;
            }
            declarations.forEach((decl) => decl.remove());
            const modernRule = rule.clone({ nodes: declarations.map((decl) => decl.clone()) });
            const supports = pc.atRule({ name: 'supports', params: SUPPORTS_RELATIVE_COLOR });
            supports.append(modernRule);
            rule.parent?.insertAfter(rule, supports);
            if (!rule.nodes?.length) {
                rule.remove();
            }
        }
    },
});
(relativeColorFallback as postcss.PluginCreator<void>).postcss = true;

const buildFallback = (): postcss.Plugin => ({
    postcssPlugin: 'build-fallback',
    OnceExit(root, { postcss: pc }) {
        const resolve = createValueResolver(root);
        const relativeRules: Array<{ rule: postcss.Rule; declarations: postcss.Declaration[] }> = [];
        const relativeLightDarkRules: ColorSchemeRule[] = [];
        const lightDarkRules: ColorSchemeRule[] = [];

        root.walkAtRules('supports', (atRule) => {
            if (hasSupportsCondition(atRule.params, SUPPORTS_RELATIVE_COLOR)) {
                atRule.walkRules((rule) => {
                    const declarations: postcss.Declaration[] = [];
                    const light: postcss.Declaration[] = [];
                    const dark: postcss.Declaration[] = [];
                    rule.walkDecls((decl) => {
                        const value = resolve(decl.value);
                        if (!value) {
                            return;
                        }
                        const colors = parseLightDark(value);
                        if (colors.light === colors.dark) {
                            declarations.push(pc.decl({ prop: decl.prop, value, important: decl.important }));
                            return;
                        }
                        const lightValue = resolve(colors.light);
                        const darkValue = resolve(colors.dark);
                        if (lightValue && darkValue) {
                            light.push(pc.decl({ prop: decl.prop, value: lightValue, important: decl.important }));
                            dark.push(pc.decl({ prop: decl.prop, value: darkValue, important: decl.important }));
                        }
                    });
                    if (declarations.length) {
                        relativeRules.push({ rule, declarations });
                    }
                    if (light.length) {
                        relativeLightDarkRules.push({ rule, light, dark });
                    }
                });
            }

            if (hasSupportsCondition(atRule.params, SUPPORTS_LIGHT_DARK)) {
                atRule.walkRules((rule) => {
                    const light: postcss.Declaration[] = [];
                    const dark: postcss.Declaration[] = [];
                    rule.walkDecls((decl) => {
                        if (!decl.value.includes('light-dark(')) {
                            return;
                        }
                        const colors = parseLightDark(decl.value);
                        const lightValue = resolve(colors.light);
                        const darkValue = resolve(colors.dark);
                        if (!lightValue || !darkValue) {
                            return;
                        }
                        light.push(pc.decl({ prop: decl.prop, value: lightValue, important: decl.important }));
                        dark.push(pc.decl({ prop: decl.prop, value: darkValue, important: decl.important }));
                    });
                    if (light.length) {
                        lightDarkRules.push({ rule, light, dark });
                    }
                });
            }
        });

        root.removeAll();
        if (lightDarkRules.length) {
            const supports = pc.atRule({ name: 'supports', params: `not ${SUPPORTS_LIGHT_DARK}` });
            appendColorSchemeRules(supports, lightDarkRules, pc);
            root.append(supports);
        }
        if (relativeRules.length) {
            const supports = pc.atRule({ name: 'supports', params: `not ${SUPPORTS_RELATIVE_COLOR}` });
            for (const { rule, declarations } of relativeRules) {
                supports.append(rule.clone({ nodes: declarations }));
            }
            appendColorSchemeRules(supports, relativeLightDarkRules, pc);
            root.append(supports);
        }
    },
});

const RE_LEGACY_COLOR_MIX =
    /color-mix\(in\s+(?:srgb|hsl),\s*(transparent|var\(--[\w-]+\))(?:\s+[\d.]+%)?\s*,\s*(transparent|var\(--[\w-]+\))(?:\s+[\d.]+%)?\s*\)/g;

function buildLegacyCss(css: string): string {
    return css.replace(RE_LEGACY_COLOR_MIX, (_match, first: string, second: string) =>
        first === 'transparent' ? second : first
    );
}

const DEV_ENTRY = '/src/client/index.tsx';
const DEV_LEGACY_CSS_PATH = '/@css-fallback/legacy.css';
const VIRTUAL_CLIENT_ID = 'virtual:css-fallback-client';
const RESOLVED_DEV_CLIENT_ID = '\0css-fallback:client';

function isCssModule(module: ModuleNode): boolean {
    return /\.p?css(?:$|\?)/i.test(module.url);
}

function collectCssModuleUrls(module: ModuleNode, visited: Set<ModuleNode>, urls: string[]): void {
    if (visited.has(module)) {
        return;
    }
    visited.add(module);

    if (isCssModule(module)) {
        urls.push(module.url);
        return;
    }

    for (const dependency of module.importedModules) {
        collectCssModuleUrls(dependency, visited, urls);
    }
}

function getInlineCss(transformResult: { code: string } | null, url: string): string {
    const match = transformResult?.code.match(/^export default\s+([\s\S]*?);?\s*$/);
    if (!match) {
        throw new Error(`[css-fallback] Could not read transformed CSS from ${url}`);
    }
    return JSON.parse(match[1]!);
}

function addInlineQuery(url: string): string {
    return `${url}${url.includes('?') ? '&' : '?'}inline`;
}

async function createDevLegacyCss(server: ViteDevServer): Promise<string> {
    // Make the entry graph available before collecting its CSS leaves. This also makes the
    // legacy stylesheet work on the very first dev-server page load.
    await server.warmupRequest(DEV_ENTRY);
    const entry = await server.moduleGraph.getModuleByUrl(DEV_ENTRY);
    const urls: string[] = [];

    if (entry) {
        collectCssModuleUrls(entry, new Set(), urls);
    } else {
        for (const module of server.moduleGraph.urlToModuleMap.values()) {
            if (isCssModule(module)) {
                urls.push(module.url);
            }
        }
    }

    const css = (
        await Promise.all(
            [...new Set(urls)].map(async (url) => getInlineCss(await server.transformRequest(addInlineQuery(url)), url))
        )
    ).join('\n');
    const fallback = await postcss([buildFallback()]).process(css, { from: undefined });
    return `${buildLegacyCss(css)}\n${fallback.css}`;
}

const devClientCode = `
const legacyCssPath = ${JSON.stringify(DEV_LEGACY_CSS_PATH)};
const supportsModernCss = () =>
    window.CSS &&
    window.CSS.supports &&
    window.CSS.supports('color', 'light-dark(white, black)') &&
    window.CSS.supports('background', 'hsl(from red h s l)') &&
    window.CSS.supports('color', 'color-mix(in srgb, red, blue)');

let legacyLink;
const loadLegacyCss = (timestamp = Date.now()) => {
    if (!legacyLink) {
        legacyLink = document.createElement('link');
        legacyLink.rel = 'stylesheet';
        document.head.append(legacyLink);
    }
    legacyLink.href = legacyCssPath + '?t=' + timestamp;
};

if (!supportsModernCss()) {
    loadLegacyCss();
    if (import.meta.hot) {
        import.meta.hot.on('css-fallback:update', ({ timestamp }) => loadLegacyCss(timestamp));
    }
}
`;

export function cssFallback(options: { outDir: string; sourceFile: string; outputFile: string }): Plugin {
    const outputBasename = path.basename(options.outputFile);
    const sourceBasename = path.basename(options.sourceFile);
    let devMode = false;
    let devCss: string | undefined;
    let devCssPromise: Promise<string> | undefined;

    const invalidateDevCss = () => {
        devCss = undefined;
        devCssPromise = undefined;
    };

    const getDevCss = (server: ViteDevServer) => {
        if (devCss) {
            return Promise.resolve(devCss);
        }
        devCssPromise ??= createDevLegacyCss(server).then((css) => {
            devCss = css;
            return css;
        });
        return devCssPromise;
    };

    return {
        name: 'css-fallback',
        enforce: 'post',
        configResolved(config) {
            devMode = config.command === 'serve';
        },
        resolveId(id) {
            return id === VIRTUAL_CLIENT_ID ? RESOLVED_DEV_CLIENT_ID : undefined;
        },
        load(id) {
            if (id !== RESOLVED_DEV_CLIENT_ID) {
                return undefined;
            }
            return devMode ? devClientCode : 'export {};';
        },
        configureServer(server) {
            server.middlewares.use(DEV_LEGACY_CSS_PATH, (_request, response, next) => {
                void getDevCss(server)
                    .then((css) => {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/css; charset=utf-8');
                        response.setHeader('Cache-Control', 'no-store');
                        response.end(css);
                    })
                    .catch(next);
            });
        },
        handleHotUpdate(context) {
            if (!/\.p?css$/i.test(context.file)) {
                return;
            }
            invalidateDevCss();
            context.server.ws.send({
                type: 'custom',
                event: 'css-fallback:update',
                data: { timestamp: Date.now() },
            });
        },
        async closeBundle(this: PluginContext) {
            const srcPath = path.resolve(options.outDir, options.sourceFile);
            if (!fs.existsSync(srcPath)) {
                this.warn(`[css-fallback] Source file not found: ${srcPath}`);
                return;
            }
            const css = fs.readFileSync(srcPath, 'utf8');
            const fallback = await postcss([buildFallback()]).process(css, { from: srcPath });
            const outPath = path.resolve(options.outDir, options.outputFile);
            const legacyCss = `${buildLegacyCss(css)}\n${fallback.css}`;
            fs.writeFileSync(outPath, legacyCss, 'utf8');

            const indexPath = path.resolve(options.outDir, 'index.html');
            const html = fs.readFileSync(indexPath, 'utf8');
            const stylesheet = `<link rel="stylesheet" crossorigin href="/assets/${sourceBasename}">`;
            const loader = `<script>(function(){const modern=window.CSS&&CSS.supports&&CSS.supports('color','light-dark(white, black)')&&CSS.supports('background','hsl(from red h s l)')&&CSS.supports('color','color-mix(in srgb, red, blue)');const link=document.createElement('link');link.rel='stylesheet';link.crossOrigin='';link.href='/assets/'+(modern?'${sourceBasename}':'${outputBasename}');document.head.append(link)})();</script>`;
            if (!html.includes(stylesheet)) {
                this.error(`[css-fallback] Stylesheet tag not found in ${indexPath}`);
            }
            fs.writeFileSync(indexPath, html.replace(stylesheet, loader), 'utf8');
            this.info(`[css-fallback] Written ${outputBasename} (${legacyCss.length} bytes)`);
        },
    };
}
