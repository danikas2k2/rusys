import path from 'node:path';

import { createRollbackConfig } from '../../vite/deploy.config.ts';

export default createRollbackConfig({
    name: 'server',
    service: 'rusys-server',
    artifactDirectory: 'server',
    root: path.resolve(import.meta.dirname, '../..'),
});
