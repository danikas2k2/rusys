import path from 'node:path';

import react from '@vitejs/plugin-react';
import type { MinifyOptions } from 'terser';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';

import { injectTags, parseTemplate } from './vite/plugins/parse-template';

export default defineConfig(({ mode }) => {
    const development = mode === 'development';

    return {
        root: path.resolve(__dirname),
        publicDir: path.resolve(__dirname, 'public'),
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
            outDir: path.resolve(__dirname, 'dist/public'),
            emptyOutDir: true,
            sourcemap: false,
            minify: 'terser',
            terserOptions: {
                compress: true,
                mangle: true,
                format: {
                    comments: false,
                },
            } satisfies MinifyOptions,
            cssCodeSplit: true, // emit CSS as real style assets, not JS-injected
            rollupOptions: {
                input: path.resolve(__dirname, 'index.html'),
                output: {
                    entryFileNames: 'assets/[name].js',
                    chunkFileNames: 'assets/[name].js',
                    assetFileNames: 'assets/[name].[ext]',
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

                        if (
                            pkg === 'react' ||
                            pkg.startsWith('react/') ||
                            pkg.startsWith('react-dom') ||
                            pkg.startsWith('react-router') ||
                            pkg === 'react-error-boundary' ||
                            pkg.includes('redux') ||
                            pkg === 'cookie' ||
                            pkg === 'set-cookie-parser' ||
                            pkg === 'immer' ||
                            pkg === 'react-compiler-runtime' ||
                            pkg === 'react-number-format' ||
                            pkg === 'reselect' ||
                            pkg === 'scheduler' ||
                            pkg === 'use-sync-external-store' ||
                            pkg.startsWith('@react-oauth/')
                        ) {
                            return 'react';
                        }

                        if (
                            pkg.startsWith('@mantine/') ||
                            pkg.startsWith('@tabler/') ||
                            pkg.startsWith('@floating-ui/')
                        ) {
                            return 'mantine';
                        }

                        if (pkg.startsWith('@dnd-kit/')) {
                            return 'dnd-kit';
                        }

                        if (pkg === 'axios') {
                            return 'axios';
                        }

                        if (pkg === 'transliteration') {
                            return 'translit';
                        }

                        if (
                            pkg.startsWith('@babel/') ||
                            pkg.startsWith('react-remove-scroll') ||
                            pkg === 'attr-accept' ||
                            pkg === 'clsx' ||
                            pkg === 'detect-node-es' ||
                            pkg === 'fast-deep-equal' ||
                            pkg === 'file-selector' ||
                            pkg === 'get-nonce' ||
                            pkg === 'jwt-decode' ||
                            pkg === 'klona' ||
                            pkg === 'lodash' ||
                            pkg === 'prop-types' ||
                            pkg === 'react-dropzone' ||
                            pkg === 'react-style-singleton' ||
                            pkg === 'react-textarea-autosize' ||
                            pkg === 'tabbable' ||
                            pkg === 'tslib' ||
                            pkg === 'use-callback-ref' ||
                            pkg === 'use-composed-ref' ||
                            pkg === 'use-isomorphic-layout-effect' ||
                            pkg === 'use-latest' ||
                            pkg === 'use-sidecar'
                        ) {
                            return 'runtime';
                        }

                        console.warn(`[VITE] unresolved package "${pkg}" from "${id}"\n`);

                        return 'other';
                    },
                },
            },
        },
        plugins: [
            // Production HTML minification (keeps index.html small in dist/)
            createHtmlPlugin({
                // We don't use this plugin for entry injection (index.html already has the module script).
                template: 'index.html',
                entry: 'src/client/index.tsx',
                inject: {
                    tags: injectTags(
                        parseTemplate(path.resolve(__dirname, 'templates/icons.html')),
                        parseTemplate(path.resolve(__dirname, 'templates/splash.html')),
                        parseTemplate(path.resolve(__dirname, 'templates/loader.html'))
                    ),
                },
                minify: !development && {
                    collapseWhitespace: true,
                    removeComments: true,
                    keepClosingSlash: true,
                    minifyCSS: true,
                    minifyJS: true,
                },
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
            svgr({ svgrOptions: {} }),
        ],
        server: {
            // Run Vite standalone server (dev mode only)
            port: 5173,
            host: 'localhost',
            hmr: {
                port: 5173,
            },
            fs: {
                allow: [path.resolve(__dirname)],
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
                'react-router',
                'react-router-dom',
                '@reduxjs/toolkit',
                'react-redux',
                'axios',
                '@mantine/core',
                '@mantine/hooks',
                '@mantine/dropzone',
                '@tabler/icons-react',
                '@dnd-kit/core',
                '@dnd-kit/sortable',
                '@dnd-kit/modifiers',
                '@dnd-kit/utilities',
                '@react-oauth/google',
            ],
        },
    };
});
