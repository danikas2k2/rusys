const { alias, configPaths } = require('react-app-rewire-alias');
const aliasMap = configPaths('./tsconfig.json');
module.exports = (config) => {
    config.resolve.fallback = {
        fs: false,
    };
    return alias(aliasMap)(config);
};
