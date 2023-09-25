/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import GeneratePackageJsonPlugin from 'generate-package-json-webpack-plugin';
// @ts-ignore
import Package from '../../package.json';
import { type WebpackPlugin } from '../types';

export default function getPackageJsonPlugin(): WebpackPlugin {
    return new GeneratePackageJsonPlugin({
        name: Package.name,
        version: Package.version,
        main: './server.js',
        engines: {
            node: '>= 18',
        },
        scripts: {
            start: 'node ./server.js',
            stop: 'node ./server.js',
        },
        peerDependencies: {
            'body-parser': '',
            cors: '',
            express: '',
            'jwt-decode': '',
            lodash: '',
            moment: '',
            'nedb-promises': '',
            react: '',
            'react-dom': '',
            'react-redux': '',
            redux: '',
        },
    }) as WebpackPlugin;
}
