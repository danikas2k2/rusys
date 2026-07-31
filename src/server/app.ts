import fs from 'node:fs';
import https from 'node:https';

import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';

import { isDevMode } from '~/common/utils/dev';
import { MAX_IMAGE_FILE_SIZE, MAX_IMPORT_FILE_SIZE } from '~/common/utils/files';
import { debug } from '~/server/api/debug';
import { IMAGES_DIR, IMAGES_URL_PATH } from '~/server/data/images';
import { ApiUrlHandlers } from '~/server/handlers';
import helmetOptions from '~/server/helmetOptions';

export function setup(app = express()): Express {
    setupHelmet(app);
    setupHandlers(app);
    setupStatic(app);
    return app;
}

export function setupHelmet(app: Express): Express {
    // If running behind a reverse proxy (typical in production), this enables correct HTTPS detection
    // via X-Forwarded-* headers for redirects and other security logic.
    app.set('trust proxy', true);

    // Force HTTPS in production (works both when Node terminates TLS and when TLS is terminated upstream).
    // Keep it off in dev to avoid Safari/localhost issues.
    if (!isDevMode()) {
        app.use((req, res, next) => {
            const xfp = (req.headers['x-forwarded-proto'] ?? '').toString();
            const isSecure = req.secure || xfp.split(',')[0]?.trim() === 'https';
            if (isSecure) {
                return next();
            }

            const host = req.headers.host;
            if (!host) {
                return next();
            }

            return res.redirect(308, `https://${host}${req.originalUrl}`);
        });
    }

    app.use(bodyParser.urlencoded({ extended: false, limit: '20mb' }));
    app.use(bodyParser.json({ inflate: true, limit: '20mb' }));
    app.use(
        fileUpload({
            abortOnLimit: true,
            safeFileNames: true,
            limits: { fileSize: MAX_IMPORT_FILE_SIZE }, // 200MB - import archives can bundle many product/category images
        })
    );
    app.use(cors());
    app.use(helmet(helmetOptions));

    if (isDevMode()) {
        app.use((_, res, next) => {
            res.setHeader('Strict-Transport-Security', 'max-age=0');
            next();
        });
    }

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
    // Serve uploaded images (category icons, product photos, ...) from the persistent volume
    app.use(IMAGES_URL_PATH, express.static(IMAGES_DIR));

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
