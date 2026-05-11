import fs from 'node:fs';
import path from 'node:path';

import postcss from 'postcss';
import type { Plugin } from 'vite';

// ---------------------------------------------------------------------------
// HSL math
// ---------------------------------------------------------------------------

interface Hsl {
    h: number; // degrees 0-360
    s: number; // 0-1
    l: number; // 0-1
}

function parseHslVar(value: string): Hsl | null {
    // catppuccin format: "10.800 58.824% 66.667%"
    const m = value.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
    if (!m) {
        return null;
    }
    return { h: parseFloat(m[1]!), s: parseFloat(m[2]!) / 100, l: parseFloat(m[3]!) / 100 };
}

function hslToHex({ h, s, l }: Hsl): string {
    const [r, g, b] = hslToRgb({ h, s, l });
    const toHex = (n: number) =>
        Math.round(n * 255)
            .toString(16)
            .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hslToString(hsl: Hsl): string {
    return hslToHex(hsl);
}

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0), f(8), f(4)];
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) {
        return { h: 0, s: 0, l };
    }
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
        h = ((b - r) / d + 2) / 6;
    } else {
        h = ((r - g) / d + 4) / 6;
    }
    return { h: h * 360, s, l };
}

// color-mix(in hsl, a P%, b Q%) — interpolate in HSL space
function colorMixHsl(a: Hsl, pA: number, b: Hsl, pB: number): Hsl {
    const t = pB / (pA + pB);
    // Hue: shortest-path interpolation
    let dh = b.h - a.h;
    if (dh > 180) {
        dh -= 360;
    }
    if (dh < -180) {
        dh += 360;
    }
    return {
        h: (a.h + dh * t + 360) % 360,
        s: a.s + (b.s - a.s) * t,
        l: a.l + (b.l - a.l) * t,
    };
}

// color-mix(in srgb, a P%, b Q%) — interpolate in linear RGB space
function colorMixSrgb(a: Hsl, pA: number, b: Hsl, pB: number): Hsl {
    const t = pB / (pA + pB);
    const [ar, ag, ab] = hslToRgb(a);
    const [br, bg, bb] = hslToRgb(b);
    return rgbToHsl(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

// Apply hsl(from <base> h calc(s * sF) calc(l * lF))
function applyHslFrom(base: Hsl, sF: number, lF: number): Hsl {
    return {
        h: base.h,
        s: Math.min(1, base.s * sF),
        l: Math.min(1, base.l * lF),
    };
}

// color(from <base> srgb r g b / alpha%) → #RRGGBBAA
function colorFromAlpha(base: Hsl, alpha: number): string {
    const [r, g, b] = hslToRgb(base);
    const toHex = (n: number) =>
        Math.round(n * 255)
            .toString(16)
            .padStart(2, '0');
    const aHex = Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${aHex}`;
}

// ---------------------------------------------------------------------------
// Static HSL dictionary from catppuccin + computed color-mix values
// ---------------------------------------------------------------------------

const CTP_LATTE: Record<string, string> = {
    rosewater: '10.800 58.824% 66.667%',
    flamingo: '0.000 59.763% 66.863%',
    pink: '316.034 73.418% 69.020%',
    mauve: '266.044 85.047% 58.039%',
    red: '347.077 86.667% 44.118%',
    maroon: '354.783 76.303% 58.627%',
    peach: '21.975 99.184% 51.961%',
    yellow: '34.948 76.984% 49.412%',
    green: '109.231 57.635% 39.804%',
    teal: '183.231 73.864% 34.510%',
    sky: '197.067 96.567% 45.686%',
    sapphire: '188.859 69.953% 41.765%',
    blue: '219.907 91.489% 53.922%',
    lavender: '230.935 97.203% 71.961%',
    text: '233.793 16.022% 35.490%',
    subtext1: '233.333 12.796% 41.373%',
    subtext0: '232.800 10.373% 47.255%',
    overlay2: '232.174 9.623% 53.137%',
    overlay1: '231.429 10.048% 59.020%',
    overlay0: '228.000 11.236% 65.098%',
    surface2: '226.667 12.162% 70.980%',
    surface1: '225.000 13.559% 76.863%',
    surface0: '222.857 15.909% 82.745%',
    base: '220.000 23.077% 94.902%',
    mantle: '220.000 21.951% 91.961%',
    crust: '220.000 20.690% 88.627%',
};

const CTP_MOCHA: Record<string, string> = {
    rosewater: '9.600 55.556% 91.176%',
    flamingo: '0.000 58.730% 87.647%',
    pink: '316.471 71.831% 86.078%',
    mauve: '267.407 83.505% 80.980%',
    red: '343.269 81.250% 74.902%',
    maroon: '350.400 65.217% 77.451%',
    peach: '22.957 92.000% 75.490%',
    yellow: '41.351 86.047% 83.137%',
    green: '115.455 54.098% 76.078%',
    teal: '170.000 57.353% 73.333%',
    sky: '189.184 71.014% 72.941%',
    sapphire: '198.500 75.949% 69.020%',
    blue: '217.168 91.870% 75.882%',
    lavender: '231.892 97.368% 85.098%',
    text: '226.154 63.934% 88.039%',
    subtext1: '226.667 35.294% 80.000%',
    subtext0: '227.647 23.611% 71.765%',
    overlay2: '228.387 16.757% 63.725%',
    overlay1: '229.655 12.775% 55.490%',
    overlay0: '230.769 10.744% 47.451%',
    surface2: '232.500 12.000% 39.216%',
    surface1: '234.286 13.208% 31.176%',
    surface0: '236.842 16.239% 22.941%',
    base: '240.000 21.053% 14.902%',
    mantle: '240.000 21.311% 11.961%',
    crust: '240.000 22.727% 8.627%',
};

function buildHslDict(): Map<string, Hsl> {
    const dict = new Map<string, Hsl>();

    for (const [name, raw] of Object.entries(CTP_LATTE)) {
        const hsl = parseHslVar(raw);
        if (hsl) {
            dict.set(`--ctp-latte-${name}`, hsl);
            dict.set(`--ctp-latte-${name}-hsl`, hsl);
        }
    }
    for (const [name, raw] of Object.entries(CTP_MOCHA)) {
        const hsl = parseHslVar(raw);
        if (hsl) {
            dict.set(`--ctp-mocha-${name}`, hsl);
            dict.set(`--ctp-mocha-${name}-hsl`, hsl);
        }
    }

    // color-mix(in hsl, yellow 60%, green 40%)
    const lLime = colorMixHsl(dict.get('--ctp-latte-yellow')!, 60, dict.get('--ctp-latte-green')!, 40);
    const mLime = colorMixHsl(dict.get('--ctp-mocha-yellow')!, 65, dict.get('--ctp-mocha-green')!, 45);
    dict.set('--ctp-latte-lime', lLime);
    dict.set('--ctp-latte-lime-hsl', lLime);
    dict.set('--ctp-mocha-lime', mLime);
    dict.set('--ctp-mocha-lime-hsl', mLime);

    // color-mix(in srgb, blue 60%, mauve 40%)
    const lViolet = colorMixSrgb(dict.get('--ctp-latte-blue')!, 60, dict.get('--ctp-latte-mauve')!, 40);
    const mViolet = colorMixSrgb(dict.get('--ctp-mocha-blue')!, 65, dict.get('--ctp-mocha-mauve')!, 45);
    dict.set('--ctp-latte-violet', lViolet);
    dict.set('--ctp-latte-violet-hsl', lViolet);
    dict.set('--ctp-mocha-violet', mViolet);
    dict.set('--ctp-mocha-violet-hsl', mViolet);

    return dict;
}

// ---------------------------------------------------------------------------
// s/l multiplier tables (from theme.pcss)
// ---------------------------------------------------------------------------

const LATTE_S = [0.5, 0.55, 0.6, 0.7, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15];
const LATTE_L = [1.3, 1.22, 1.16, 1.1, 1.05, 1.02, 1.0, 0.94, 0.88, 0.82];
const MOCHA_S = [0.59, 0.64, 0.73, 0.82, 0.91, 0.95, 1.0, 1.05, 1.09, 1.14];
const MOCHA_L = [0.7, 0.78, 0.86, 0.92, 0.97, 0.99, 1.0, 1.04, 1.12, 1.2];

// ---------------------------------------------------------------------------
// CSS value resolver
// ---------------------------------------------------------------------------

// hsl(from var(--ctp-X) h calc(s * var(--ctp-X-s-N)) calc(l * var(--ctp-X-l-N)))
// base var may be plain (--ctp-latte-rosewater) or hsl-suffixed (--ctp-latte-rosewater-hsl)
const RE_HSL_FROM =
    /^hsl\(from\s+var\((--ctp-(latte|mocha)-([\w-]+?)(?:-hsl)?)\)\s+h\s+calc\(s\s*\*\s*var\(--ctp-(latte|mocha)-s-(\d)\)\)\s+calc\(l\s*\*\s*var\(--ctp-(latte|mocha)-l-(\d)\)\)\)$/;

// color(from var(--mantine-color-X-6) srgb r g b / N%)
const RE_COLOR_FROM = /^color\(from\s+var\((--[\w-]+)\)\s+srgb\s+r\s+g\s+b\s*\/\s*([\d.]+)%\)$/;

function resolveHslFrom(value: string, dict: Map<string, Hsl>): string | null {
    const m = value.match(RE_HSL_FROM);
    if (!m) {
        return null;
    }
    // m[1]=full var, m[2]=flavor, m[3]=colorName, m[4]=sFlavor, m[5]=sIdx, m[6]=lFlavor, m[7]=lIdx
    const baseVar = m[1]!;
    const sFlavor = m[4] as 'latte' | 'mocha';
    const sIdx = parseInt(m[5]!);
    const lFlavor = m[6] as 'latte' | 'mocha';
    const lIdx = parseInt(m[7]!);

    const base = dict.get(baseVar);
    if (!base) {
        return null;
    }

    const sF = sFlavor === 'latte' ? LATTE_S[sIdx]! : MOCHA_S[sIdx]!;
    const lF = lFlavor === 'latte' ? LATTE_L[lIdx]! : MOCHA_L[lIdx]!;

    return hslToString(applyHslFrom(base, sF, lF));
}

// --mantine-color-X-6 → color name X, shade 6 = base color (s*1.0, l*1.0)
// Use latte as the representative color for color(from ...) alpha variants
const RE_MANTINE_SHADE = /^--mantine-color-([\w-]+)-(\d)$/;

function resolveColorFrom(value: string, resolvedVars: Map<string, Hsl>, dict: Map<string, Hsl>): string | null {
    const m = value.match(RE_COLOR_FROM);
    if (!m) {
        return null;
    }
    const sourceVar = m[1]!;
    const alpha = parseFloat(m[2]!) / 100;

    let base = resolvedVars.get(sourceVar);

    if (!base) {
        // --mantine-color-X-N → try resolving via --ctp-latte-X-N (already in resolvedVars)
        // or fall back to shade-6 = base hsl (s*1, l*1)
        const sm = sourceVar.match(RE_MANTINE_SHADE);
        if (sm) {
            const colorName = sm[1]!;
            const shade = parseInt(sm[2]!);
            // Try latte shade first (light mode base for alpha)
            base = resolvedVars.get(`--ctp-latte-${colorName}-${shade}`);
            if (!base) {
                // shade 6 = base color
                const baseHsl = dict.get(`--ctp-latte-${colorName}`);
                if (baseHsl) {
                    base = applyHslFrom(baseHsl, LATTE_S[shade]!, LATTE_L[shade]!);
                }
            }
        }
    }

    if (!base) {
        return null;
    }
    return colorFromAlpha(base, alpha);
}

// ---------------------------------------------------------------------------
// PostCSS plugin: wraps hsl(from...) / color(from...) in @supports blocks
// for index.css (processed at PostCSS time on source files)
// ---------------------------------------------------------------------------

const SUPPORTS_RELATIVE_COLOR = '(background: hsl(from red h s l))';

export const relativeColorFallback = (): postcss.Plugin => ({
    postcssPlugin: 'relative-color-fallback',
    OnceExit(root, { postcss: pc }) {
        const rules: postcss.Rule[] = [];
        root.walkRules((rule) => {
            let node: postcss.Container | postcss.Document | undefined = rule.parent;
            while (node) {
                if (node.type === 'atrule' && (node as postcss.AtRule).name === 'supports') {
                    return;
                }
                node = node.parent;
            }
            rules.push(rule);
        });

        for (const rule of rules) {
            const entries: Array<{ decl: postcss.Declaration }> = [];
            rule.walkDecls((decl) => {
                if (RE_HSL_FROM.test(decl.value) || RE_COLOR_FROM.test(decl.value)) {
                    entries.push({ decl });
                }
            });
            if (!entries.length) {
                continue;
            }

            for (const { decl } of entries) {
                decl.remove();
            }

            const supportsRule = rule.clone({ nodes: [] });
            for (const { decl } of entries) {
                supportsRule.append(decl.clone());
            }

            const supports = pc.atRule({ name: 'supports', params: SUPPORTS_RELATIVE_COLOR });
            supports.append(supportsRule);
            rule.parent!.insertAfter(rule, supports);
            if (!rule.nodes.length) {
                rule.remove();
            }
        }
    },
});
(relativeColorFallback as postcss.PluginCreator<void>).postcss = true;

// ---------------------------------------------------------------------------
// Vite plugin: generates fallback.css from built index.css
// ---------------------------------------------------------------------------

// Reads @supports (background: hsl(from red h s l)) blocks from index.css,
// resolves all values to static hsl()/rgba(), emits @supports not { @media light/dark }
// Resolve a single var(--name) reference from resolvedVars → hsl string, or null
const RE_SINGLE_VAR = /^var\((--[\w-]+)\)$/;

function resolveVar(value: string, resolvedVars: Map<string, Hsl>, dict?: Map<string, Hsl>): string | null {
    const m = value.trim().match(RE_SINGLE_VAR);
    if (!m) {
        return null;
    }
    const hsl = resolvedVars.get(m[1]!) ?? dict?.get(m[1]!);
    return hsl ? hslToString(hsl) : null;
}

const buildFallback = (dict: Map<string, Hsl>): postcss.Plugin => {
    return {
        postcssPlugin: 'build-fallback',
        OnceExit(root, { postcss: pc }) {
            const SUPPORTS_NOT_LD = 'not (color: light-dark(white, black))';
            const SUPPORTS_NOT_RC = `not ${SUPPORTS_RELATIVE_COLOR}`;

            // --- Pass 1: resolve @supports hsl(from...) blocks, build resolvedVars ---
            // Must run before Pass 2 so var(--ctp-X-N) in light-dark values can be resolved.
            const resolvedVars = new Map<string, Hsl>();
            const rcRules: Array<{
                rule: postcss.Rule;
                entries: Array<{ decl: postcss.Declaration; resolved: string }>;
            }> = [];

            root.walkAtRules('supports', (atrule) => {
                if (atrule.params !== SUPPORTS_RELATIVE_COLOR) {
                    return;
                } // skip LD block in this pass
                atrule.walkRules((rule) => {
                    const entries: Array<{ decl: postcss.Declaration; resolved: string }> = [];
                    rule.walkDecls((decl) => {
                        let resolved: string | null = null;
                        if (RE_HSL_FROM.test(decl.value)) {
                            resolved = resolveHslFrom(decl.value, dict);
                            if (resolved && decl.prop.startsWith('--')) {
                                const inner = resolved.slice(4, -1);
                                const hsl = parseHslVar(inner);
                                if (hsl) {
                                    resolvedVars.set(decl.prop, hsl);
                                }
                            }
                        } else if (RE_COLOR_FROM.test(decl.value)) {
                            resolved = resolveColorFrom(decl.value, resolvedVars, dict);
                        }
                        if (resolved) {
                            entries.push({ decl, resolved });
                        }
                    });
                    if (entries.length) {
                        rcRules.push({ rule, entries });
                    }
                });
            });

            // --- Pass 2: collect @supports light-dark blocks, resolve var() to static values ---
            const ldRules: Array<{
                rule: postcss.Rule;
                entries: Array<{ decl: postcss.Declaration; light: string; dark: string }>;
            }> = [];

            root.walkAtRules('supports', (atrule) => {
                if (atrule.params !== '(color: light-dark(white, black))') {
                    return;
                }
                atrule.walkRules((rule) => {
                    const entries: Array<{ decl: postcss.Declaration; light: string; dark: string }> = [];
                    rule.walkDecls((decl) => {
                        if (!/\blight-dark\s*\(/.test(decl.value)) {
                            return;
                        }
                        let { light, dark } = parseLightDark(decl.value);
                        // Resolve var() references to static values
                        light = resolveVar(light, resolvedVars, dict) ?? light;
                        dark = resolveVar(dark, resolvedVars, dict) ?? dark;
                        entries.push({ decl, light, dark });
                    });
                    if (entries.length) {
                        ldRules.push({ rule, entries });
                    }
                });
            });

            root.removeAll();

            // Build @supports not (light-dark) { @media light { } @media dark { } }
            if (ldRules.length) {
                const supportsNotLd = pc.atRule({ name: 'supports', params: SUPPORTS_NOT_LD });
                for (const { rule, entries } of ldRules) {
                    const lightRule = rule.clone({ nodes: [] });
                    const darkRule = rule.clone({ nodes: [] });
                    for (const { decl, light, dark } of entries) {
                        lightRule.append(pc.decl({ prop: decl.prop, value: light, important: decl.important }));
                        if (light !== dark) {
                            darkRule.append(pc.decl({ prop: decl.prop, value: dark, important: decl.important }));
                        }
                    }
                    const lm = pc.atRule({ name: 'media', params: '(prefers-color-scheme: light)' });
                    lm.append(lightRule);
                    supportsNotLd.append(lm);
                    if (darkRule.nodes.length) {
                        const dm = pc.atRule({ name: 'media', params: '(prefers-color-scheme: dark)' });
                        dm.append(darkRule);
                        supportsNotLd.append(dm);
                    }
                }
                root.append(supportsNotLd);
            }

            // Build @supports not (hsl(from ...)) { plain resolved values }
            if (rcRules.length) {
                const supportsNotRc = pc.atRule({ name: 'supports', params: SUPPORTS_NOT_RC });
                for (const { rule, entries } of rcRules) {
                    const resolvedRule = rule.clone({ nodes: [] });
                    for (const { decl, resolved } of entries) {
                        resolvedRule.append(pc.decl({ prop: decl.prop, value: resolved, important: decl.important }));
                    }
                    supportsNotRc.append(resolvedRule);
                }
                root.append(supportsNotRc);
            }
        },
    };
};

// ---------------------------------------------------------------------------
// light-dark parser (duplicated from postcss.config.mjs — TS-safe version)
// ---------------------------------------------------------------------------

function splitAtCommaOrParen(char: string, str: string): [string, string] {
    let i = 0;
    let depth = 0;
    while (i < str.length && (str[i] !== char || depth)) {
        if (str[i] === '(') {
            depth++;
        }
        if (str[i] === ')') {
            depth--;
        }
        i++;
    }
    return [str.slice(0, i), str.slice(i + 1)];
}

function parseLightDark(value: string): { light: string; dark: string } {
    const fn = 'light-dark(';
    const idx = value.indexOf(fn);
    if (idx === -1) {
        return { light: value, dark: value };
    }
    const prefix = value.slice(0, idx);
    const rest = value.slice(idx + fn.length);
    const [args, suffix] = splitAtCommaOrParen(')', rest);
    const [lightRaw, darkRaw] = splitAtCommaOrParen(',', args);
    const light = prefix + parseLightDark(lightRaw.trim()).light + parseLightDark(suffix).light;
    const dark = prefix + parseLightDark(darkRaw.trim()).dark + parseLightDark(suffix).dark;
    return { light, dark };
}

// ---------------------------------------------------------------------------
// Vite plugin export
// ---------------------------------------------------------------------------

export function cssFallback(options: { outDir: string; sourceFile: string; outputFile: string }): Plugin {
    const outputBasename = path.basename(options.outputFile);
    const dict = buildHslDict();

    return {
        name: 'css-fallback',
        apply: 'build',
        enforce: 'post',

        transformIndexHtml() {
            return [
                {
                    tag: 'link',
                    attrs: { rel: 'stylesheet', href: `/assets/${outputBasename}` },
                    injectTo: 'head',
                },
            ];
        },

        async closeBundle() {
            const srcPath = path.resolve(options.outDir, options.sourceFile);
            if (!fs.existsSync(srcPath)) {
                this.warn(`[css-fallback] Source file not found: ${srcPath}`);
                return;
            }

            const css = fs.readFileSync(srcPath, 'utf8');
            const result = await postcss([buildFallback(dict)]).process(css, { from: srcPath });

            const outPath = path.resolve(options.outDir, options.outputFile);
            fs.writeFileSync(outPath, result.css, 'utf8');
            this.info(`[css-fallback] Written ${outputBasename} (${result.css.length} bytes)`);
        },
    };
}
