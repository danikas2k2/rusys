import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import { handleCheckUser } from '~/server/app/handleCheckUser';
import { handleClientId } from '~/server/app/handleClientId';
import { handleLoad } from '~/server/app/handleLoad';
import { handleMove } from '~/server/app/handleMove';
import { handleRemove } from '~/server/app/handleRemove';
import { handleRemoveGroup } from '~/server/app/handleRemoveGroup';
import { handleRename } from '~/server/app/handleRename';
import { handleRenameGroup } from '~/server/app/handleRenameGroup';
import { handleSetDetails } from '~/server/app/handleSetDetails';
import { handleSetMissing } from '~/server/app/handleSetMissing';
import { handleSetRemoving } from '~/server/app/handleSetRemoving';
import { handleSummary } from '~/server/app/handleSummary';
import { handleUpdateDetails } from '~/server/app/handleUpdateDetails';

// TODO add groups: uogienės, daržovienės, šaldyta, daržovės, kruopos, pom.padažai, sriubos

export default function (app = express()): Express {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ inflate: true }));
    app.use(cors());

    // eslint-disable-next-line import/no-named-as-default-member
    app.use(express.static('public'));

    app.get('/clientId', handleClientId);
    // TODO use GET here
    app.post('/checkUser', handleCheckUser);
    app.get('/load', handleLoad);
    app.get('/summary', handleSummary);
    // TODO use PUT? here
    app.post('/setDetails', handleSetDetails);
    // TODO use PATCH here
    app.post('/updateDetails', handleUpdateDetails);
    // TODO use PUT? here
    app.post('/setRemoving', handleSetRemoving);
    // TODO use PUT? here
    app.post('/setMissing', handleSetMissing);
    // TODO deprecated
    app.post('/setName', handleRename);
    // TODO use PATCH here
    app.post('/rename', handleRename);
    // TODO use PATCH here
    app.post('/renameGroup', handleRenameGroup);
    // TODO use DELETE here
    app.post('/remove', handleRemove);
    // TODO use DELETE here
    app.post('/removeGroup', handleRemoveGroup);
    // TODO use PATCH here
    app.post('/move', handleMove);

    return app;
}
