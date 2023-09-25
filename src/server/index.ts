import app from './app';

(async () => {
    const { debug } = console;
    const port = +(process.env.PORT || 3000);
    const host = process.env.HOST || 'localhost';
    app().listen(port, host, () => {
        debug(`Server listening on ${host}:${port}`);
    });
})();
