import { ApiUrlHandlers } from '~/server/handlers';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';

export default function (app = express()): Express {
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
    app.use(helmet());

    app.use(express.static('public'));

    for (const [url, handler] of Object.entries(ApiUrlHandlers)) {
        app.post(url, handler);
    }

    return app;
}
