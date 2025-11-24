import { EnvironmentPlugin } from 'webpack';

import type { WebpackPlugin } from '../types';

export function getEnvironmentPlugin(isDevMode: boolean): WebpackPlugin {
    return new EnvironmentPlugin({
        LOCALE: 'lt-LT',
        DEBUG: isDevMode,
    });
}
