import path from 'node:path';

import { createDeployConfig } from '../../vite/deploy.config.ts';

export default createDeployConfig({
    name: 'client',
    service: 'rusys-client',
    artifactDirectory: 'client',
    root: path.resolve(import.meta.dirname, '../..'),
});
