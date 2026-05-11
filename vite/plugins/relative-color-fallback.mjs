// PostCSS plugin: wraps hsl(from...) and color(from...) declarations in
// @supports (background: hsl(from red h s l)) { ... }
// so that browsers without relative color syntax ignore them,
// and fallback.css can provide resolved static values under @supports not.

const RE_HSL_FROM = /\bhsl\(from\s/;
const RE_COLOR_FROM = /\bcolor\(from\s/;

const SUPPORTS_RELATIVE_COLOR = '(background: hsl(from red h s l))';

export const relativeColorFallback = () => ({
    postcssPlugin: 'relative-color-fallback',
    OnceExit(root, { postcss }) {
        const rules = [];
        root.walkRules((rule) => {
            let node = rule.parent;
            while (node) {
                if (node.type === 'atrule' && node.name === 'supports') return;
                node = node.parent;
            }
            rules.push(rule);
        });

        for (const rule of rules) {
            const entries = [];
            rule.walkDecls((decl) => {
                if (RE_HSL_FROM.test(decl.value) || RE_COLOR_FROM.test(decl.value)) {
                    entries.push(decl);
                }
            });
            if (!entries.length) continue;

            for (const decl of entries) decl.remove();

            const supportsRule = rule.clone({ nodes: [] });
            for (const decl of entries) supportsRule.append(decl.clone());

            const supports = postcss.atRule({ name: 'supports', params: SUPPORTS_RELATIVE_COLOR });
            supports.append(supportsRule);
            rule.parent.insertAfter(rule, supports);
            if (!rule.nodes.length) rule.remove();
        }
    },
});
relativeColorFallback.postcss = true;
