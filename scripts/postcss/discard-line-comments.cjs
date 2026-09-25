module.exports = () => ({
    postcssPlugin: 'postcss-discard-line-comments',
    Declaration(declaration) {
        if (declaration.prop.startsWith('//')) {
            declaration.remove();
        }
    },
});

module.exports.postcss = true;
