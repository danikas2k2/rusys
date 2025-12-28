import { execSync } from 'node:child_process';
import path from 'node:path';

import type { Plugin } from 'vite';

interface DeployConfig {
    serverUser?: string;
    serverHost?: string;
    serverPort?: string;
    remotePath?: string;
}

export function deploy(config?: DeployConfig): Plugin {
    const {
        serverUser = process.env.DEPLOY_USER,
        serverHost = process.env.DEPLOY_HOST,
        serverPort = process.env.DEPLOY_PORT ?? '22',
        remotePath = process.env.DEPLOY_PATH,
    } = config || {};

    return {
        name: 'deploy',
        enforce: 'post',
        configResolved() {},
        async closeBundle() {
            console.log('🚀 Starting deployment...');

            try {
                const distPath = path.resolve(process.cwd(), 'dist');
                const dockerComposePath = path.resolve(process.cwd(), 'docker/compose.yaml');
                const dockerfilePath = path.resolve(process.cwd(), 'docker/Dockerfile');

                // Upload dist files
                console.log('📤 Uploading dist files...');
                execSync(
                    // Use --checksum so unchanged files are not recopied even if build touched mtimes.
                    `rsync -avz --checksum -e "ssh -p ${serverPort}" --delete ${distPath}/ ${serverUser}@${serverHost}:${remotePath}/dist/`,
                    { stdio: 'inherit' }
                );

                // Upload docker files
                console.log('📤 Uploading docker files...');
                execSync(
                    `rsync -avz -e "ssh -p ${serverPort}" ${dockerComposePath} ${serverUser}@${serverHost}:${remotePath}/compose.yaml`,
                    { stdio: 'inherit' }
                );
                execSync(
                    `rsync -avz -e "ssh -p ${serverPort}" ${dockerfilePath} ${serverUser}@${serverHost}:${remotePath}/Dockerfile`,
                    { stdio: 'inherit' }
                );

                // Build and restart containers
                console.log('🐳 Building and restarting containers...');
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && docker compose up -d --build"`,
                    { stdio: 'inherit' }
                );

                console.log('✅ Deployment completed successfully!');
            } catch (error) {
                console.error('❌ Deployment failed!', error);
                process.exit(1);
            }
        },
    };
}
