import path from 'node:path';

import react from '@vitejs/plugin-react';
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
                    manualChunks: {
                        react: ['react', 'react-dom'],
                        router: ['react-router', 'react-router-dom'],
                        mantine: ['@mantine/core', '@mantine/hooks', '@mantine/dropzone'],
                        tabler: ['@tabler/icons-react'],
                        'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/modifiers'],
                    },
                },
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
                'react-router',
                'react-router-dom',
                '@mantine/core',
                '@mantine/hooks',
                '@mantine/dropzone',
                '@tabler/icons-react',
                '@dnd-kit/core',
                '@dnd-kit/sortable',
                '@dnd-kit/modifiers',
            ],
        },
    };
});
