import path from 'node:path';

import { createDeployConfig } from '../../vite/deploy.config.ts';

export default createDeployConfig({
    name: 'server',
    service: 'rusys-server',
    artifactDirectory: 'server',
    root: path.resolve(import.meta.dirname, '../..'),
});
