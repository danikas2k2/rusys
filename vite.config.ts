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
            emptyOutDir: false, // Don't clear dist since server.js is there
            sourcemap: true,
            minify: 'esbuild',
            cssCodeSplit: true, // emit CSS as real style assets, not JS-injected
            rollupOptions: {
                input: path.resolve(__dirname, 'public/index.html'),
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                    assetFileNames: '[name].[ext]',
                    manualChunks(id) {
                        if (!id.includes('node_modules')) return undefined;

                        if (
                            id.includes('react/jsx-runtime') ||
                            id.includes('react/jsx-dev-runtime') ||
                            id.includes('react-compiler-runtime') ||
                            id.includes('react-dom') ||
                            id.includes('scheduler') ||
                            id.includes('react-number-format') ||
                            /[/\\]react[/\\]cjs[/\\]/.test(id)
                        ) {
                            return 'react';
                        }

                        if (id.includes('react-router')) return 'router';

                        if (
                            id.includes('@reduxjs/toolkit') ||
                            id.includes('react-redux') ||
                            /[/\\]redux[/\\]/.test(id) ||
                            /[/\\]immer[/\\]/.test(id)
                        ) {
                            return 'redux';
                        }

                        if (id.includes('@mantine') || id.includes('@floating-ui')) {
                            return 'mantine';
                        }

                        if (id.includes('@tabler/icons-react')) return 'tabler';
                        if (id.includes('@dnd-kit')) return 'dnd-kit';
                        if (id.includes('axios')) return 'axios';
                        if (id.includes('lodash')) return 'lodash';
                        if (id.includes('transliteration')) return 'translit';
                        if (id.includes('react-dropzone') || id.includes('file-selector')) return 'dropzone';

                        return undefined;
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
