import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';
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
            }),
            svgr({
                svgrOptions: {},
            }),
        ],
        define: {
            'process.env.LOCALE': JSON.stringify('lt-LT'),
            'process.env.DEBUG': JSON.stringify(isDev),
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        resolve: {
            alias: {
                '~': path.resolve(__dirname, './src'),
                '@tests': path.resolve(__dirname, './src/tests'),
                '@ui': path.resolve(__dirname, './src/ui'),
                'package.json': path.resolve(__dirname, './package.json'),
            },
            extensions: ['.jsx', '.js', '.tsx', '.ts', '.module.pcss', '.pcss', '.css', '.svg'],
        },
        css: {
            modules: {
                // Automatically treat .module.pcss files as CSS modules
                // Use regex pattern - Vite automatically strips query params before matching
                include: /\.module\.pcss$/,
                // Exclude node_modules and theme.pcss
                exclude: /node_modules|theme\.pcss/,
                generateScopedName: (name, filename) => {
                    // Remove query params from filename for processing
                    const filenameWithoutQuery = filename.split('?')[0];
                    const isDev = process.env.NODE_ENV === 'development';
                    if (isDev) {
                        // Match webpack's [path][name]__[local] pattern
                        // Remove .module.pcss extension to get the base filename
                        const filenameWithoutModule = filenameWithoutQuery.replace(/\.module\.pcss$/, '');
                        const relativePath = path.relative(__dirname, filenameWithoutModule);
                        const dirname = path.dirname(relativePath);
                        const basename = path.basename(relativePath);

                        // Build path parts (directory structure)
                        const pathParts = dirname.split(path.sep).filter(Boolean).join('__');

                        // Combine: [path][name]__[local]
                        // If pathParts is empty, just use name__local
                        if (pathParts) {
                            return `${pathParts}__${basename}__${name}`;
                        }
                        return `${basename}__${name}`;
                    }
                    // Production: use hash (base64, 5 chars like webpack)
                    const hash = createHash('md5')
                        .update(filenameWithoutQuery + name)
                        .digest('base64')
                        .slice(0, 5)
                        .replaceAll(/[^a-zA-Z0-9]/g, '_');
                    return `_${hash}_${name}`;
                },
                localsConvention: 'camelCaseOnly',
            },
            postcss: './postcss.config.mjs',
        },
        build: {
            outDir: 'dist/public',
            emptyOutDir: false, // Don't clear dist since server.js is there
            sourcemap: true,
            rollupOptions: {
                input: path.resolve(__dirname, 'public/index.html'),
                output: {
                    entryFileNames: 'app.js',
                    chunkFileNames: '[name].js',
                    assetFileNames: '[name].[ext]',
                    manualChunks: {
                        react: ['react', 'react-dom'],
                        router: ['react-router', 'react-router-dom'],
                    },
                },
            },
        },
        server: {
            // Run Vite as standalone dev server
            port: 5173,
            host: 'localhost',
            hmr: {
                port: 5173,
            },
            // Proxy API requests to Express server
            proxy: {
                // Proxy all API endpoints to Express server
                '^/(products|clientId|checkUser|summary|groups|variants|export|import)': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                },
            },
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router', 'react-router-dom'],
        },
    };
});
