import fs from 'fs';
import https from 'https';
import app from './app';

(async () => {
    const { debug } = console;
    const {
        PORT = 3000,
        HOST = 'localhost',
        HTTPS_PORT = 3333,
        HTTPS_HOST = HOST,
        HTTPS_KEY,
        HTTPS_CERT,
    } = process.env;

    const APP = app();

    // Create HTTP server
    APP.listen(+PORT, HOST, () => {
        debug(`HTTP Server listening on ${HOST}:${PORT}`);
    });

    if (HTTPS_KEY && HTTPS_CERT) {
        // Create HTTPS server
        const httpsOptions = {
            key: fs.readFileSync(HTTPS_KEY),
            cert: fs.readFileSync(HTTPS_CERT),
        };

        https.createServer(httpsOptions, APP).listen(+HTTPS_PORT, HTTPS_HOST, () => {
            debug(`HTTPS Server listening on ${HTTPS_HOST}:${HTTPS_PORT}`);
        });
    }
})();
