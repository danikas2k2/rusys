import { execSync } from 'node:child_process';
import path from 'node:path';

interface DeployConfig {
    serverUser?: string;
    serverHost?: string;
    serverPort?: string;
    remotePath?: string;
}

const BACKUP_DIR = '.deploy-backup';

function getConfig(config?: DeployConfig): Required<DeployConfig> {
    const {
        serverUser = process.env.DEPLOY_USER,
        serverHost = process.env.DEPLOY_HOST,
        serverPort = process.env.DEPLOY_PORT ?? '22',
        remotePath = process.env.DEPLOY_PATH,
    } = config || {};

    if (!serverUser || !serverHost || !remotePath) {
        throw new Error('DEPLOY_USER, DEPLOY_HOST and DEPLOY_PATH must be set.');
    }

    return { serverUser, serverHost, serverPort, remotePath };
}

export function deploy(config?: DeployConfig) {
    const { serverUser, serverHost, serverPort, remotePath } = getConfig(config);

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

                // Keep exactly one known-good release: the files that were live immediately before
                // this deployment. This must happen before the first rsync, which uses --delete.
                console.log('💾 Backing up the current release...');
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && test -d dist && rm -rf ${BACKUP_DIR} && mkdir ${BACKUP_DIR} && cp -a dist ${BACKUP_DIR}/dist && cp compose.yaml Dockerfile ${BACKUP_DIR}/"`,
                    { stdio: 'inherit' }
                );

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

export function rollback(config?: DeployConfig) {
    const { serverUser, serverHost, serverPort, remotePath } = getConfig(config);

    return {
        name: 'deploy-rollback',
        enforce: 'post',
        async closeBundle() {
            console.log('↩️  Rolling back deployment...');

            try {
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && test -d ${BACKUP_DIR}/dist && test -f ${BACKUP_DIR}/compose.yaml && test -f ${BACKUP_DIR}/Dockerfile && rm -rf dist && cp -a ${BACKUP_DIR}/dist ./dist && cp ${BACKUP_DIR}/compose.yaml ./compose.yaml && cp ${BACKUP_DIR}/Dockerfile ./Dockerfile && docker compose up -d --build"`,
                    { stdio: 'inherit' }
                );

                console.log('✅ Rollback completed successfully!');
            } catch (error) {
                console.error('❌ Rollback failed!', error);
                process.exit(1);
            }
        },
    };
}
