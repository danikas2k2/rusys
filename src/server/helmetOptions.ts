import type { HelmetOptions } from 'helmet';

import { isDevMode } from '~/common/utils/dev';

const prodInlineScriptHashes: string[] = ["'unsafe-inline'"]; // Replace with actual hashes in production for better security

const helmetOptions: Readonly<HelmetOptions> = {
    hsts: isDevMode()
        ? false
        : {
              maxAge: 180 * 86400, // 180 days
              includeSubDomains: false,
              preload: false,
          },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://accounts.google.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            connectSrc: [
                "'self'",
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com',
                'https://accounts.google.com',
                'https://openidconnect.googleapis.com',
                'https://www.googleapis.com',
                ...(isDevMode() ? ['ws://localhost:5173', 'ws://127.0.0.1:5173'] : []),
            ],
            frameSrc: ["'self'", 'https://accounts.google.com'],
            scriptSrc: ["'self'", 'https://accounts.google.com'],
            scriptSrcElem: [
                "'self'",
                'https://accounts.google.com',
                ...(isDevMode() ? ["'unsafe-inline'"] : prodInlineScriptHashes),
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: isDevMode() ? null : [],
        },
    },
};

export default helmetOptions;
