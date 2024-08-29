import { type WebpackPerformance } from './types';

export function getPerformance(isDevMode = false): WebpackPerformance {
    return {
        maxAssetSize: (isDevMode ? 20 : 5) << 20, // TODO: decrease to 1MB
        maxEntrypointSize: (isDevMode ? 20 : 5) << 20, // TODO: decrease to 1MB
        hints: 'error',
        // assetFilter: (assetFilename: string) => !assetFilename.endsWith('.jpg'),
    };
}
