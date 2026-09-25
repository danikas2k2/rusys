// Next loads PostCSS plugins with CommonJS `require`. postcss-nested 8 is ESM
// and exposes its factory as `default`, so adapt it at this boundary.
module.exports = (options) => require('postcss-nested').default(options);
