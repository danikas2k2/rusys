import path from 'node:path';

import { createRollbackConfig } from '../../vite/deploy.config.ts';

export default createRollbackConfig({
    name: 'client',
    service: 'rusys-client',
    artifactDirectory: 'client',
    root: path.resolve(import.meta.dirname, '../..'),
});
