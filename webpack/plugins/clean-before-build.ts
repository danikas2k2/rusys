import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { type WebpackPlugin } from '../types';

export default function getCleanBeforeBuildPlugin(): WebpackPlugin {
    return new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*', '!server.js'],
    });
}
