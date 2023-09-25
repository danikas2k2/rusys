/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { type WebpackPlugin } from '../types';

export default function getCopyPublicPlugin(): WebpackPlugin {
    return new CopyWebpackPlugin({
        patterns: [
            {
                from: 'public',
                globOptions: { ignore: ['**/index.html'] },
            },
        ],
    });
}
