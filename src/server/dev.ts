import setupApp from '~/server/app';
import webpackDevConfig from '../../webpack.dev.config';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

(async () => {
    const { debug } = console;

    const app = express();
    const config = await webpackDevConfig();
    const compiler = webpack(config);

    // Enable "webpack-dev-middleware"
    app.use(
        webpackDevMiddleware(compiler, {
            writeToDisk: true,
            publicPath: config.output?.publicPath,
        })
    );

    // Enable "webpack-hot-middleware"
    app.use(webpackHotMiddleware(compiler));

    setupApp(app);

    const port = +(process.env.PORT || 3000);
    const host = process.env.HOST || 'localhost';
    app.listen(port, host, () => {
        debug(`Server listening on ${host}:${port}`);
    });
})();
