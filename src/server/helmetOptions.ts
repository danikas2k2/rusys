import { isDevMode } from '~/common/utils/dev';

const prodInlineScriptHashes: string[] = ["'unsafe-inline'"]; // Replace with actual hashes in production for better security

export default {
    // HSTS forces HTTPS and causes Safari to upgrade http://localhost:3000 to
    // https://localhost:3000 where we do not serve TLS; keep it off.
    hsts: false,
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
            // Do NOT auto-upgrade http→https; Safari would then try TLS on 3000 and fail.
            upgradeInsecureRequests: null,
        },
    },
};
