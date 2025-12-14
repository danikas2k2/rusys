import path from 'node:path';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';

import { buildServer } from './vite/plugins/build-server';
import { deploy } from './vite/plugins/deploy';
import { generatePackageJson } from './vite/plugins/generate-package-json';

export default defineConfig(({ mode }) => {
    const development = mode === 'development';

    return {
        root: process.cwd(),
        publicDir: 'public',
        plugins: [
            createHtmlPlugin({
                template: 'public/index.html',
                entry: '/src/client/index.tsx',
            }),
            react({
                jsxRuntime: 'automatic',
                jsxImportSource: 'react',
                babel: {
                    plugins: [
                        ['babel-plugin-react-compiler', { target: '19', development }],
                        ...(development
                            ? []
                            : [
                                  [
                                      '@babel/plugin-transform-react-jsx',
                                      { runtime: 'automatic', importSource: 'react', development },
                                  ],
                              ]),
                    ],
                },
            }),
            svgr({
                svgrOptions: {},
            }),
            generatePackageJson(),
            ...(development ? [] : [buildServer()]),
            ...(development || !process.env.DEPLOY ? [] : [deploy()]),
        ],
        define: {
            'process.env.LOCALE': JSON.stringify('lt-LT'),
            'process.env.DEBUG': JSON.stringify(development),
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        resolve: {
            alias: {
                '~': path.resolve(__dirname, './src'),
                '@tests': path.resolve(__dirname, './src/tests'),
                'package.json': path.resolve(__dirname, './package.json'),
            },
            dedupe: ['react', 'react-dom'],
            extensions: ['.jsx', '.js', '.tsx', '.ts', '.pcss', '.css', '.svg'],
        },
        css: {
            postcss: './postcss.config.mjs',
        },
        build: {
            outDir: 'dist/public',
            emptyOutDir: true,
            sourcemap: false,
            // minify: 'esbuild',
            minify: 'terser',
            terserOptions: {
                compress: true,
                mangle: true,
                format: {
                    comments: false,
                },
            },
            treeshake: true,
            cssCodeSplit: true, // emit CSS as real style assets, not JS-injected
            rollupOptions: {
                input: path.resolve(__dirname, 'public/index.html'),
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                    assetFileNames: '[name].[ext]',
                    manualChunks(id) {
                        let pos = id.indexOf('node_modules/');
                        if (pos < 0) {
                            return undefined;
                        }

                        // cut to node_modules/
                        let pkg = id.substring(pos + 'node_modules/'.length);

                        // cut to .pnpm/
                        pos = pkg.indexOf('.pnpm/');
                        if (pos >= 0) {
                            pkg = pkg.substring(pos + '.pnpm/'.length);
                        }

                        // cut versions after @
                        pos = pkg.indexOf('@', 1);
                        if (pos > 0) {
                            pkg = pkg.substring(0, pos);
                        }

                        // replace plus with slash for scoped packages
                        pkg = pkg.replaceAll('+', '/');

                        // react and related
                        if (
                            pkg === 'react' ||
                            pkg.startsWith('react/') ||
                            pkg.startsWith('react-dom') ||
                            pkg.startsWith('react-router') ||
                            pkg === 'react-compiler-runtime' ||
                            pkg === 'react-number-format' ||
                            pkg === 'scheduler' ||
                            pkg === 'cookie' ||
                            pkg === 'set-cookie-parser' ||
                            pkg.includes('redux') ||
                            pkg === 'reselect' ||
                            pkg === 'immer' ||
                            pkg === 'use-sync-external-store'
                        ) {
                            return 'react';
                        }

                        // mantine and related
                        if (
                            pkg.startsWith('@mantine/') ||
                            pkg.startsWith('@tabler/') ||
                            pkg.startsWith('@floating-ui/') ||
                            pkg.startsWith('react-remove-scroll') ||
                            pkg === 'react-textarea-autosize' ||
                            pkg === 'react-style-singleton' ||
                            pkg === 'react-dropzone' ||
                            pkg === 'file-selector' ||
                            pkg === 'detect-node-es' ||
                            pkg === 'get-nonce' ||
                            pkg === 'use-latest' ||
                            pkg === 'use-sidecar' ||
                            pkg === 'use-composed-ref' ||
                            pkg === 'use-callback-ref' ||
                            pkg === 'use-isomorphic-layout-effect' ||
                            pkg === 'tabbable' ||
                            pkg === 'clsx' ||
                            pkg === 'klona' ||
                            pkg === 'attr-accept'
                        ) {
                            return 'mantine';
                        }

                        // dnd-kit
                        if (pkg.startsWith('@dnd-kit/')) {
                            return 'dnd-kit';
                        }

                        // axios
                        if (pkg === 'axios') {
                            return 'axios';
                        }

                        // translit
                        if (pkg === 'transliteration') {
                            return 'translit';
                        }

                        // runtime
                        if (
                            pkg === 'lodash' ||
                            pkg === 'tslib' ||
                            pkg === 'prop-types' ||
                            pkg === 'fast-deep-equal' ||
                            pkg === 'jwt-decode' ||
                            pkg.startsWith('@babel/') ||
                            pkg.startsWith('@react-oauth/')
                        ) {
                            return 'runtime';
                        }

                        console.warn(`[VITE] unresolved package "${pkg}" from "${id}"\n`);

                        return 'other';
                    },
                },
                plugins: [
                    visualizer({
                        template: 'treemap',
                        gzipSize: true,
                        brotliSize: true,
                        filename: 'dist/public/stats.html',
                    }),
                    visualizer({
                        template: 'raw-data',
                        gzipSize: true,
                        brotliSize: true,
                        filename: 'dist/public/stats.json',
                    }),
                ],
            },
        },
        server: {
            // Run Vite standalone server (dev mode only)
            port: 5173,
            host: 'localhost',
            hmr: {
                port: 5173,
            },
            // Proxy API requests to Express server
            proxy: {
                // Proxy all API endpoints to Express server
                '^/(products|groups|variants|export|import|clientId|checkUser|summary)': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                },
            },
        },
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'react/jsx-dev-runtime',
                'react-router',
                'react-router-dom',
                '@reduxjs/toolkit',
                'react-redux',
                'redux',
                'immer',
                'axios',
                '@mantine/core',
                '@mantine/hooks',
                '@mantine/dropzone',
                '@tabler/icons-react',
                '@dnd-kit/core',
                '@dnd-kit/sortable',
                '@dnd-kit/modifiers',
                '@dnd-kit/utilities',
            ],
        },
    };
});
