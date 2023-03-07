import type { RawLoaderDefinitionFunction } from 'webpack';

interface WebpackCssModuleWrapperOptions {
    classNames?: boolean;
}

const WebpackCssModuleWrapper: RawLoaderDefinitionFunction<WebpackCssModuleWrapperOptions> = function (
    content: string | Buffer
): Buffer {
    const { classNames = true } = this.getOptions() ?? {};

    const bindStyles: string[] = [];
    let result = content
        .toString()
        .replace(/^(\s*)import\s+['"]([^'"]+\.(?:c|pc|le|s[ac])ss)['"]\s*;/gm, (found, spaces, path) => {
            const name = path.replace(/\W/g, '_');
            bindStyles.push(name);
            return `${spaces}import ${name} from '${path}';`;
        });
    if (!bindStyles.length) {
        // no styles imported, do nothing
        return Buffer.from(content);
    }

    let fnClassNames: string | undefined;
    let fnClassNamesBind: string | undefined;
    if (classNames) {
        result = result.replace(/import\s+(\w+)\s+from\s+['"]classnames['"]\s*;/, (found, name) => {
            fnClassNames = name;
            fnClassNamesBind = `${fnClassNames}__bind`;
            return `import ${fnClassNamesBind} from 'classnames/bind';`;
        });
    }

    if (!classNames) {
        return Buffer.from(
            result.replace(/\bclassName\s*=\s*(['"])([^'"]+)\1/g, (found, quote, classNames) => {
                return `className={[${classNames
                    .split(/\s+/)
                    .map((s: string) => bindStyles.map((b) => `${b}.${s}`).join(', '))
                    .join(' ')}].filter(Boolean).join(' ')}`;
            })
        );
    }

    const lastImport = result.match(/(import[^;]+;)(?!.*\bimport\b)/s);
    let cursor = (lastImport?.index ?? 0) + (lastImport?.[1]?.length ?? 0);

    if (!fnClassNames) {
        const hasClassNames = result.match(/\bclassName\s*=/);
        if (!hasClassNames) {
            // no classNames imported and no classes used, do nothing
            return Buffer.from(content);
        }

        fnClassNames = '__classNames';
        fnClassNamesBind = `${fnClassNames}__bind`;
        const importBind = `\nimport ${fnClassNamesBind} from 'classnames/bind';`;
        result = result.slice(0, cursor) + importBind + result.slice(cursor);
        cursor += importBind.length;
    }

    const binding = bindStyles.length === 1 ? bindStyles[0] : `{\n${bindStyles.map((s) => `    ...${s},\n`).join('')}}`;
    result =
        result.slice(0, cursor) +
        `\n\nconst ${fnClassNames} = ${fnClassNamesBind}.bind(${binding});` +
        result.slice(cursor);

    return Buffer.from(
        result.replace(/\bclassName\s*=\s*(['"])([^'"]+)\1/g, (found, quote, classNames) => {
            return `className={${fnClassNames}('${classNames.split(/\s+/).join(`', '`)}')}`;
        })
    );
};
export default WebpackCssModuleWrapper;
