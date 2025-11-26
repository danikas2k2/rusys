import express from 'express';
import { createServer } from 'vite';

import { setupHandlers, setupHelmet, setupStatic, startServers } from '~/server/app';

(async () => {
    const app = setupHelmet(express());

    // Register API handlers BEFORE Vite middleware
    // This ensures API routes are handled before Vite tries to serve them
    setupHandlers(app);

    // Create Vite server in middleware mode for Express integration
    const vite = await createServer({
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

    // Register static file serving AFTER Vite middleware
    setupStatic(app);

    // Start both HTTP and HTTPS servers
    startServers(app);
})();
