import fs from 'node:fs';
import https from 'node:https';

import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';

import { isDevMode } from '~/common/utils/dev';
import { debug } from '~/server/api/debug';
import { ApiUrlHandlers } from '~/server/handlers';

export function setup(app = express()): Express {
    setupHelmet(app);
    setupHandlers(app);
    setupStatic(app);
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
            // HSTS forces HTTPS and causes Safari to upgrade http://localhost:3000 to
            // https://localhost:3000 where we do not serve TLS; keep it off.
            hsts: false,
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        'https://fonts.googleapis.com',
                        'https://accounts.google.com',
                    ],
                    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                    connectSrc: [
                        "'self'",
                        'https://fonts.googleapis.com',
                        'https://fonts.gstatic.com',
                        'https://accounts.google.com',
                        ...(isDevMode() ? ['ws://localhost:5173', 'ws://127.0.0.1:5173'] : []),
                    ],
                    frameSrc: ["'self'", 'https://accounts.google.com'],
                    scriptSrc: ["'self'", 'https://accounts.google.com'],
                    scriptSrcElem: [
                        "'self'",
                        'https://accounts.google.com',
                        ...(isDevMode()
                            ? ["'unsafe-inline'"]
                            : [
                                  "'sha256-mbTwxdcXUg0s6mhly7FJi2jXODihmXHhrVN/FpIlCwM='",
                                  "'sha256-xRKNH4JayJQcJDGldAWebkbAJG3ZWLgsYaEGIyxbzBI='",
                              ]),
                    ],
                    objectSrc: ["'none'"],
                    // Do NOT auto-upgrade http→https; Safari would then try TLS on 3000 and fail.
                    upgradeInsecureRequests: null,
                },
            },
        })
    );

    // Explicitly clear any previously stored HSTS policy for localhost/127.0.0.1 in browsers
    // that may have cached it from earlier runs. Only effective over HTTPS, so this is mainly
    // for the 4000 port; harmless elsewhere.
    app.use((_, res, next) => {
        res.setHeader('Strict-Transport-Security', 'max-age=0');
        next();
    });

    return app;
}

export function setupHandlers(app: Express): Express {
    // Register API routes first
    for (const [url, handler] of Object.entries(ApiUrlHandlers)) {
        app.post(url, handler);
    }

    return app;
}

export function setupStatic(app: Express): Express {
    // Serve static files
    app.use(express.static('public'));

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

export function startServers(app: Express): Express {
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

    return app;
}
