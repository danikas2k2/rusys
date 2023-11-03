import CopyWebpackPlugin from 'copy-webpack-plugin';
import { type WebpackPlugin } from '../types';

export function getCopyPublicPlugin(): WebpackPlugin {
    return new CopyWebpackPlugin({
        patterns: [
            {
                from: 'public',
                globOptions: { ignore: ['**/index.html', '**/tutorial.html'] },
            },
        ],
    });
}
