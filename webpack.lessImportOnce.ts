import type { RawLoaderDefinitionFunction } from 'webpack';

const uniqueImports = new Map<string, string>();

const WebpackLessImportOnce: RawLoaderDefinitionFunction = function (content: string | Buffer): Buffer {
    const { resourcePath } = this;
    const localImports = new Map<string, string>();
    return Buffer.from(
        content
            .toString()
            .replace(
                /[ \t]*@import\s*\(\s*(?:\w+\s*,\s*)*once(?:\s*,\s*\w+)*\s*\)\s*(?:url\(\s*'([^']+)'?\s*\)|url\(\s*"([^"]+)"?\s*\)|url\(\s*([^)]+)\s*\)|'([^']+)'|"([^"]+)")\s*;[ \t]*\n?/g,
                (
                    found,
                    pathUrlSingleQuotes,
                    pathUrlDoubleQuotes,
                    pathUrlNoQuotes,
                    pathSingleQuotes,
                    pathDoubleQuotes
                ) => {
                    const path =
                        pathUrlSingleQuotes ||
                        pathUrlDoubleQuotes ||
                        pathUrlNoQuotes ||
                        pathSingleQuotes ||
                        pathDoubleQuotes;
                    const importedByResource = uniqueImports.get(path);
                    // prevent importing the same file twice
                    if (importedByResource != null && importedByResource !== resourcePath) {
                        return '';
                    }
                    // prevent importing the same file twice in the same file
                    if (localImports.has(path)) {
                        return '';
                    }
                    localImports.set(path, resourcePath);
                    uniqueImports.set(path, resourcePath);
                    return found;
                }
            )
    );
};

export default WebpackLessImportOnce;

export const reset = (): void => uniqueImports.clear();
