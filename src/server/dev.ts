import { setupHandlers, setupHelmet, startHttpServer, startHttpsServer } from '~/server/app';
import webpackDevConfig from '../../webpack.dev.config';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

(async () => {
    const app = setupHelmet(express());

    const config = await webpackDevConfig();
    const compiler = webpack(config);
    if (!compiler) {
        throw new Error('Failed to create webpack compiler');
    }

    // Enable "webpack-dev-middleware"
    app.use(
        webpackDevMiddleware(compiler, {
            writeToDisk: true,
            publicPath: config.output?.publicPath,
        })
    );

    // Enable "webpack-hot-middleware"
    app.use(webpackHotMiddleware(compiler));

    setupHandlers(app);

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
