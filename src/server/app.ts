import fs from 'fs';
import https from 'https';

import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';

import { isDevMode } from '~/common/utils/env';
import { debug } from '~/server/api/debug';
import { ApiUrlHandlers } from '~/server/handlers';

export function setup(app = express()): Express {
    setupHelmet(app);
    setupHandlers(app);
    return app;
}

export function setupHelmet(app: Express): Express {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ inflate: true }));
    app.use(
        fileUpload({
            abortOnLimit: true,
            safeFileNames: true,
            limits: { fileSize: 1 << 20 }, // 1MB
        })
    );
    app.use(cors());
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
                    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                    connectSrc: [
                        "'self'",
                        'https://fonts.googleapis.com',
                        'https://fonts.gstatic.com',
                        // Allow Vite HMR WebSocket in dev (Vite runs on port 5173)
                        ...(isDevMode() ? ['ws://localhost:5173', 'ws://127.0.0.1:5173', 'http://localhost:5173'] : []),
                    ],
                    scriptSrc: ["'self'", 'https://accounts.google.com'],
                    scriptSrcElem: [
                        "'self'",
                        'https://accounts.google.com',
                        // Allow inline scripts in dev (Vite needs this)
                        // In production, allow inline script for color scheme detection
                        ...(isDevMode()
                            ? ["'unsafe-inline'"]
                            : ["'sha256-h4JJ0OX2ltWY5N6XW6FZ08KKolxndLCwhB+x5/+geeg='"]),
                    ],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            },
        })
    );

    return app;
}

export function setupHandlers(app: Express): Express {
    const staticPath = 'public';

    // Register API routes first
    for (const [url, handler] of Object.entries(ApiUrlHandlers)) {
        app.post(url, handler);
    }

    // Serve static files
    app.use(express.static(staticPath));

    // SPA fallback: serve index.html for all GET requests that don't match static files or API routes
    if (!isDevMode()) {
        app.use((req, res) => {
            // Only handle GET requests
            if (req.method === 'GET') {
                res.sendFile('index.html', { root: staticPath });
            } else {
                res.status(404).send('Not found');
            }
        });
    }

    return app;
}

interface HttpServerOptions {
    port?: number;
    host?: string;
}

export function startHttpServer(app: Express, { port = 3000, host = 'localhost' }: HttpServerOptions): Express {
    app.listen(port, host, () => {
        debug(`HTTP server listening on http://${host}:${port}`);
    });
    return app;
}

interface HttpsServerOptions extends HttpServerOptions {
    keyFile?: string;
    certFile?: string;
}

export function startHttpsServer(
    app: Express,
    { port = 4000, host = 'localhost', keyFile, certFile }: HttpsServerOptions
): Express {
    if (keyFile && certFile) {
        https
            .createServer({ key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }, app)
            .listen(port, host, () => {
                debug(`HTTPS server listening on https://${host}:${port}`);
            });
    }
    return app;
}
