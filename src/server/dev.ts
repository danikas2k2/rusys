import express from 'express';

import { setupHandlers, setupHelmet, setupStatic, startServers } from '~/server/app';

// Express server for API only
// Vite dev server runs separately on port 5173 with proxy to this server
const app = setupHelmet(express());

// Register API handlers
setupHandlers(app);

// Register static file serving (for production builds)
setupStatic(app);

// Start both HTTP and HTTPS servers
// Vite dev server will proxy API requests to this server
startServers(app);
