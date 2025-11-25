import express from 'express';
import { createServer as createViteServer } from 'vite';

import { setupHandlers, setupHelmet, startHttpServer, startHttpsServer } from '~/server/app';

(async () => {
    const app = setupHelmet(express());

    // Register API handlers BEFORE Vite middleware
    // This ensures API routes are handled before Vite tries to serve them
    setupHandlers(app);

    // Create Vite server in middleware mode for Express integration
    const vite = await createViteServer({
        server: {
            middlewareMode: true,
            hmr: {
                port: 24678,
            },
        },
        appType: 'spa',
    });

    // Use Vite middleware to handle client requests
    // This should be AFTER API handlers so API routes work correctly
    // Vite middleware automatically handles index.html transformation with React Refresh
    app.use(vite.middlewares);

    const {
        PORT = 3000,
        HOST = 'localhost',
        HTTPS_PORT = 4000,
        HTTPS_HOST = HOST,
        HTTPS_KEY,
        HTTPS_CERT,
    } = process.env;

    startHttpServer(app, {
        port: +PORT,
        host: HOST,
    });

    startHttpsServer(app, {
        port: +HTTPS_PORT,
        host: HTTPS_HOST,
        keyFile: HTTPS_KEY,
        certFile: HTTPS_CERT,
    });
})();
