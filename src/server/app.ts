import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import { ApiUrlHandlers } from '~/server/handlers';

export default function (app = express()): Express {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ inflate: true }));
    app.use(cors());

    // eslint-disable-next-line import/no-named-as-default-member
    app.use(express.static('public'));

    for (const [url, handler] of Object.entries(ApiUrlHandlers)) {
        app.post(url, handler);
    }

    return app;
}
