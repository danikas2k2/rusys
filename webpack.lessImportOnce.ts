import type { RawLoaderDefinitionFunction } from 'webpack';

const uniqueImports = new Map<string, string>();

const WebpackLessImportOnce: RawLoaderDefinitionFunction = function (content) {
    // const options = this.getOptions() ?? {};
    const { resourcePath /*, loaders, loaderIndex*/ } = this;

    // const loader = loaders[loaderIndex];
    // const logger = this.getLogger('less-import-once');

    // this.emitWarning()
    // this.emitError()
    // this.getLogger()
    // this.resolve()
    // this.getResolve()
    // this.emitFile()
    // this.addBuildDependency()
    // this.utils.absolutify()
    // this.utils.contextify()
    // this.utils.createHash()
    // this.rootContext = '/Users/asteponavicius/dev/rusys'
    // this.sourceMap = false
    // this.mode = 'development'

    return content
        .toString()
        .replace(
            /[ \t]*@import\s*\(\s*(?:\w+\s*,\s*)*once(?:\s*,\s*\w+)*\s*\)\s*(?:url\(\s*'([^']+)'?\s*\)|url\(\s*"([^"]+)"?\s*\)|url\(\s*([^)]+)\s*\)|'([^']+)'|"([^"]+)")\s*;[ \t]*\n?/g,
            (found, pathUrlSingleQuotes, pathUrlDoubleQuotes, pathUrlNoQuotes, pathSingleQuotes, pathDoubleQuotes) => {
                const path =
                    pathUrlSingleQuotes ||
                    pathUrlDoubleQuotes ||
                    pathUrlNoQuotes ||
                    pathSingleQuotes ||
                    pathDoubleQuotes;
                const importedByResource = uniqueImports.get(path);
                if (importedByResource != null && importedByResource !== resourcePath) {
                    return '';
                }
                uniqueImports.set(path, resourcePath);
                return found;
            }
        );
};

export default WebpackLessImportOnce;

export const reset = (): void => uniqueImports.clear();
