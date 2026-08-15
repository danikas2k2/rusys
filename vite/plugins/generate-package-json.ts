import fs from 'node:fs';
import path from 'node:path';

import type { Plugin } from 'vite';

import Package from '../../package.json' with { type: 'json' };

export function generatePackageJson(): Plugin {
    return {
        name: 'package-json',
        enforce: 'post',
        writeBundle() {
            const distPath = path.resolve(process.cwd(), 'dist');
            const packageJsonPath = path.join(distPath, 'package.json');

            // Create dist directory if it doesn't exist
            if (!fs.existsSync(distPath)) {
                fs.mkdirSync(distPath, { recursive: true });
            }

            // Generate package.json for server
            const generatedPackageJson = {
                name: Package.name,
                version: Package.version,
                author: Package.author,
                license: Package.license,
                type: 'module',
                main: 'server.js',
                engines: {
                    node: (Package.engines as { node?: string })?.node || '>= 18',
                },
                scripts: {
                    start: 'node server.js',
                    stop: 'node server.js',
                },
                dependencies: {},
                peerDependencies: getPeerDependencies([
                    'body-parser',
                    'cors',
                    'express',
                    'express-fileupload',
                    'helmet',
                    'jwt-decode',
                    'lodash',
                    'mongodb',
                    'react',
                    'react-dom',
                    'react-redux',
                    'redux',
                    'sharp',
                ]),
            };

            fs.writeFileSync(packageJsonPath, JSON.stringify(generatedPackageJson, null, 2) + '\n');
        },
    };
}

function getPeerDependencies(deps: string[]): Record<string, string> {
    const peerDependencies: Record<string, string> = {};
    for (const depName of deps) {
        peerDependencies[depName] = getDependencyVersion(depName);
    }
    return peerDependencies;
}

function getDependencyVersion(depName: string): string {
    return (
        (Package.dependencies as Record<string, string> | undefined)?.[depName] ||
        (Package.devDependencies as Record<string, string> | undefined)?.[depName] ||
        ''
    );
}
