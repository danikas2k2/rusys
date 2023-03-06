import type { RawLoaderDefinitionFunction } from 'webpack';

interface WebpackCssModuleWrapperOptions {
    classNames?: boolean;
}

const WebpackCssModuleWrapper: RawLoaderDefinitionFunction<WebpackCssModuleWrapperOptions> = function (content) {
    const { classNames = true } = this.getOptions() ?? {};

    const bindStyles: string[] = [];
    let result = content
        .toString()
        .replace(/^\s*import\s+['"]([^'"]+\.(?:c|pc|le|s[ac])ss)['"]\s*;/gm, (found, path) => {
            // let result = content.replace(/\brequire\s*\(\s*"([^"]+\.(?:c|pc|le|s[ac])ss)"\s*\)\s*;/g, (found, path) => {
            const name = path.replace(/\W/g, '_');
            bindStyles.push(name);
            return `import ${name} from '${path}';`;
            // return `const ${name} = __importDefault(require("${path}"));`;
        });
    if (!bindStyles.length) {
        // no styles imported, do nothing
        return content;
    }

    let fnClassNames: string | undefined;
    let fnClassNamesBind: string | undefined;
    if (classNames) {
        result = result.replace(/import\s+(\w+)\s+from\s+['"]classnames['"]\s*;/, (found, name) => {
            // result = result.replace(
            //     /\bconst\s+(\w+)\s*=\s*__importDefault\s*\(\s*require\s*\(\s*"classnames"\s*\)\s*\)\s*;/g,
            //     (found, name, index) => {
            fnClassNames = name;
            fnClassNamesBind = `${fnClassNames}__bind`;
            return `import ${fnClassNamesBind} from 'classnames/bind';`;
            // return `const ${fnClassNamesBind} = __importDefault(require("classnames/bind"));`;
        });
    }

    const lastImport = result.match(/(import[^;]+;)(?!.*\bimport\b)/s);
    let cursor = (lastImport?.index ?? 0) + (lastImport?.[1]?.length ?? 0);

    if (classNames) {
        if (!fnClassNames) {
            // const hasClassNames = result.match(/\bclassName\s*:/);
            const hasClassNames = result.match(/\bclassName\s*=/);
            if (!hasClassNames) {
                // no classNames imported and no classes used, do nothing
                return content;
            }

            fnClassNames = '__classNames';
            fnClassNamesBind = `${fnClassNames}__bind`;
            const importBind = `\nimport ${fnClassNamesBind} from 'classnames/bind';`;
            // const importBind = `\nconst ${fnClassNamesBind} = __importDefault(require("classnames/bind"));`;
            result = result.slice(0, cursor) + importBind + result.slice(cursor);
            cursor += importBind.length;
        }

        const binding =
            bindStyles.length === 1 ? bindStyles[0] : `{\n${bindStyles.map((s) => `    ...${s},\n`).join('')}}`;
        result =
            result.slice(0, cursor) +
            `\n\nconst ${fnClassNames} = ${fnClassNamesBind}.bind(${binding});` +
            // `\nconst ${fnClassNames} = ${fnClassNamesBind}.default.bind(${binding});` +
            result.slice(cursor);

        result = result.replace(/\bclassName\s*=\s*(['"])([^'"]+)\1/g, (found, quote, classNames) => {
            // result = result.replace(/\bclassName\s*:\s*"([^"]+)"/g, (found, classNames, index) => {
            return `className={${fnClassNames}('${classNames.split(/\s+/).join(`', '`)}')}`;
            // return `className: ${fnClassNames}('${classNames.split(/\s+/).join(`','`)}')`;
        });
    } else {
        result = result.replace(/\bclassName\s*=\s*(['"])([^'"]+)\1/g, (found, quote, classNames) => {
            return `className={[${classNames
                .split(/\s+/)
                .map((s: string) => bindStyles.map((b) => `${b}.${s}`).join(', '))
                .join(' ')}].filter(Boolean).join(' ')}`;
        });
    }

    return result;
};
export default WebpackCssModuleWrapper;
