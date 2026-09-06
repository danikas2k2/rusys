import express from 'express';

import { setupHandlers, setupHelmet, setupStatic, startHttpServer } from '~/server/app';

// Express server for API only
// Vite dev server runs separately on port 5173 with proxy to this server
const app = setupHelmet(express());

// Register API handlers
setupHandlers(app);

// Serve uploaded images; Vite serves client static files.
setupStatic(app);

// Start HTTP server only - Vite dev server proxies API requests to it over HTTP,
// so the HTTPS listener isn't needed locally
const { PORT = 3000, HOST = 'localhost' } = process.env;
startHttpServer(app, { port: +PORT, host: HOST });
