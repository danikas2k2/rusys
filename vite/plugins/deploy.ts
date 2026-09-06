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

export interface DeployTargetConfig {
    /** Human-readable target name, used in log and backup names. */
    name: string;
    /** Docker Compose service to rebuild, for example `rusys-client`. */
    service: string;
    /** Directory below both `dist/` and `docker/`, for example `client`. */
    artifactDirectory: string;
    /** Absolute path to the repository root. */
    root: string;
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
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && test -d dist && test -d docker && rm -rf ${backupPath} && mkdir ${backupPath} && cp -a dist ${backupPath}/dist && cp -a docker ${backupPath}/docker"`,
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

                // Build and restart containers
                console.log('🐳 Building and restarting containers...');
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && ${dockerPath} compose -f docker/compose.yaml up -d --build"`,
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
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && test -d ${backupPath}/dist && test -d ${backupPath}/docker && rm -rf dist docker && cp -a ${backupPath}/dist ./dist && cp -a ${backupPath}/docker ./docker && ${dockerPath} compose -f docker/compose.yaml up -d --build"`,
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

function getTargetConfig(config: DeployTargetConfig) {
    const serverUser = process.env.DEPLOY_USER;
    const serverHost = process.env.DEPLOY_HOST;
    const serverPort = process.env.DEPLOY_PORT ?? '22';
    const remotePath = process.env.DEPLOY_PATH;
    const dockerPath = process.env.DOCKER_PATH ?? 'docker';

    if (!serverUser || !serverHost || !remotePath) {
        throw new Error('DEPLOY_USER, DEPLOY_HOST and DEPLOY_PATH must be set.');
    }

    return { ...config, serverUser, serverHost, serverPort, remotePath, dockerPath };
}

export function deployTarget(config: DeployTargetConfig) {
    const { name, service, artifactDirectory, root, serverUser, serverHost, serverPort, remotePath, dockerPath } =
        getTargetConfig(config);
    const backupPath = `.backup-${name}`;

    return {
        name: `deploy-${name}`,
        enforce: 'post' as const,
        closeBundle() {
            try {
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && test -d dist/${artifactDirectory} && test -d docker/${artifactDirectory} && rm -rf ${backupPath} && mkdir ${backupPath} && cp -a dist/${artifactDirectory} ${backupPath}/${artifactDirectory} && cp -a docker/${artifactDirectory} ${backupPath}/docker-${artifactDirectory} && cp docker/compose.yaml ${backupPath}/compose.yaml"`,
                    { stdio: 'inherit' }
                );
                execSync(
                    `rsync -avz --checksum -e "ssh -p ${serverPort}" --delete ${root}/dist/${artifactDirectory}/ ${serverUser}@${serverHost}:${remotePath}/dist/${artifactDirectory}/`,
                    { stdio: 'inherit' }
                );
                execSync(
                    `rsync -avz --delete -e "ssh -p ${serverPort}" ${root}/docker/${artifactDirectory}/ ${serverUser}@${serverHost}:${remotePath}/docker/${artifactDirectory}/`,
                    { stdio: 'inherit' }
                );
                execSync(
                    `rsync -avz -e "ssh -p ${serverPort}" ${root}/docker/compose.yaml ${serverUser}@${serverHost}:${remotePath}/docker/compose.yaml`,
                    { stdio: 'inherit' }
                );
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && ${dockerPath} compose -f docker/compose.yaml up -d --build ${service}"`,
                    { stdio: 'inherit' }
                );
            } catch (error) {
                console.error(`❌ ${name} deployment failed!`, error);
                process.exit(1);
            }
        },
    };
}

export function rollbackTarget(config: DeployTargetConfig) {
    const { name, service, artifactDirectory, serverUser, serverHost, serverPort, remotePath, dockerPath } =
        getTargetConfig(config);
    const backupPath = `.backup-${name}`;

    return {
        name: `rollback-${name}`,
        enforce: 'post' as const,
        closeBundle() {
            try {
                execSync(
                    `ssh -p ${serverPort} ${serverUser}@${serverHost} "cd ${remotePath} && test -d ${backupPath}/${artifactDirectory} && test -d ${backupPath}/docker-${artifactDirectory} && test -f ${backupPath}/compose.yaml && rm -rf dist/${artifactDirectory} docker/${artifactDirectory} && cp -a ${backupPath}/${artifactDirectory} dist/${artifactDirectory} && cp -a ${backupPath}/docker-${artifactDirectory} docker/${artifactDirectory} && cp ${backupPath}/compose.yaml docker/compose.yaml && ${dockerPath} compose -f docker/compose.yaml up -d --build ${service}"`,
                    { stdio: 'inherit' }
                );
            } catch (error) {
                console.error(`❌ ${name} rollback failed!`, error);
                process.exit(1);
            }
        },
    };
}
