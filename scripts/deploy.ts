import { execSync } from 'node:child_process';
import path from 'node:path';

interface DeployConfig {
    serverUser?: string;
    serverHost?: string;
    serverPort?: string;
    remotePath?: string;
    backupPath?: string;
    dockerPath?: string;
}

function getConfig(config?: DeployConfig): Required<DeployConfig> {
    const {
        serverUser = process.env.DEPLOY_USER,
        serverHost = process.env.DEPLOY_HOST,
        serverPort = process.env.DEPLOY_PORT ?? '22',
        remotePath = process.env.DEPLOY_PATH,
        backupPath = process.env.BACKUP_PATH ?? '.backup',
        dockerPath = process.env.DOCKER_PATH ?? 'docker',
    } = config || {};

    if (!serverUser || !serverHost || !remotePath) {
        throw new Error('DEPLOY_USER, DEPLOY_HOST and DEPLOY_PATH must be set.');
    }

    return {
        serverUser,
        serverHost,
        serverPort,
        remotePath,
        backupPath,
        dockerPath,
    };
}

export function deploy(config?: DeployConfig) {
    const { serverUser, serverHost, serverPort, remotePath, backupPath, dockerPath } = getConfig(config);

    return {
        name: 'deploy',
        enforce: 'post',
        configResolved() {},
        async closeBundle() {
            console.log('🚀 Starting deployment...');

            try {
                const distPath = path.resolve(process.cwd(), 'dist');
                const dockerPathLocal = path.resolve(process.cwd(), 'docker');

                // Keep exactly one known-good release: the files that were live immediately before
                // this deployment. This must happen before the first rsync, which uses --delete.
                console.log('💾 Backing up the current release...');
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && rm -rf ${backupPath}.next && mkdir ${backupPath}.next && if ${dockerPath} container inspect rusys-app >/dev/null 2>&1 && test -d dist && test -f compose.yaml && test -f Dockerfile; then cp -a dist ${backupPath}.next/dist && cp compose.yaml ${backupPath}.next/compose.yaml && cp Dockerfile ${backupPath}.next/Dockerfile && printf legacy > ${backupPath}.next/layout; elif test -d dist && test -d docker; then cp -a dist ${backupPath}.next/dist && cp -a docker ${backupPath}.next/docker && printf monorepo > ${backupPath}.next/layout; else echo 'Cannot identify the current deployment layout.' >&2 && rm -rf ${backupPath}.next && exit 1; fi && rm -rf ${backupPath} && mv ${backupPath}.next ${backupPath}"`,
                    { stdio: 'inherit' }
                );

                console.log('📤 Uploading all build artifacts...');
                execSync(
                    `rsync -avz --checksum -e "ssh -p ${serverPort}" --delete ${distPath}/ ${serverUser}@${serverHost}:${remotePath}/dist/`,
                    { stdio: 'inherit' }
                );

                // Upload docker files
                console.log('📤 Uploading docker files...');
                execSync(
                    `rsync -avz --delete -e "ssh -p ${serverPort}" ${dockerPathLocal}/ ${serverUser}@${serverHost}:${remotePath}/docker/`,
                    { stdio: 'inherit' }
                );

                console.log('🐳 Building and restarting containers...');
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && if ${dockerPath} container inspect rusys-app >/dev/null 2>&1; then ${dockerPath} compose --env-file .env -f compose.yaml down; fi && ${dockerPath} compose --env-file .env -f docker/compose.yaml up -d --build --remove-orphans"`,
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
    const { serverUser, serverHost, serverPort, remotePath, backupPath, dockerPath } = getConfig(config);

    return {
        name: 'deploy-rollback',
        enforce: 'post',
        async closeBundle() {
            console.log('↩️  Rolling back deployment...');

            try {
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && if test -f ${backupPath}/layout && grep -qx monorepo ${backupPath}/layout && test -d ${backupPath}/dist && test -d ${backupPath}/docker; then rm -rf dist docker && cp -a ${backupPath}/dist ./dist && cp -a ${backupPath}/docker ./docker && ${dockerPath} compose --env-file .env -f docker/compose.yaml up -d --build; elif test -f ${backupPath}/layout && grep -qx legacy ${backupPath}/layout && test -d ${backupPath}/dist && test -f ${backupPath}/compose.yaml && test -f ${backupPath}/Dockerfile; then ${dockerPath} compose --env-file .env -f docker/compose.yaml down && rm -rf dist docker && cp -a ${backupPath}/dist ./dist && cp ${backupPath}/compose.yaml ./compose.yaml && cp ${backupPath}/Dockerfile ./Dockerfile && ${dockerPath} compose --env-file .env -f compose.yaml up -d --build; else echo 'No valid deployment backup found.' >&2 && exit 1; fi"`,
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
