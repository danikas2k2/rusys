import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

interface DeployConfig {
    serverUser?: string;
    serverHost?: string;
    serverPort?: string;
    remotePath?: string;
    dockerPath?: string;
}

function getConfig(config?: DeployConfig): Required<DeployConfig> {
    const {
        serverUser = process.env.DEPLOY_USER,
        serverHost = process.env.DEPLOY_HOST,
        serverPort = process.env.DEPLOY_PORT ?? '22',
        remotePath = process.env.DEPLOY_PATH,
        dockerPath = process.env.DOCKER_PATH ?? 'docker',
    } = config || {};

    if (!serverUser || !serverHost || !remotePath) {
        throw new Error('DEPLOY_USER, DEPLOY_HOST and DEPLOY_PATH must be set.');
    }

    return { serverUser, serverHost, serverPort, remotePath, dockerPath };
}

function shellQuote(value: string): string {
    return `'${value.replaceAll("'", "'\\''")}'`;
}

function createConnection(config: Required<DeployConfig>) {
    const { serverUser, serverHost, serverPort, remotePath, dockerPath } = config;
    const address = `${serverUser}@${serverHost}`;
    const root = path.resolve(process.cwd());
    const remoteHeader = `set -eu
cd ${shellQuote(remotePath)}
docker=${shellQuote(dockerPath)}
`;

    return {
        remote(script: string, streamOutput = false) {
            return execFileSync('ssh', ['-p', serverPort, address, 'sh', '-s'], {
                input: remoteHeader + script,
                encoding: 'utf8',
                stdio: ['pipe', streamOutput ? 'inherit' : 'pipe', 'inherit'],
            });
        },
        upload(destination: string, sources: string[], options: string[] = []) {
            execFileSync(
                'rsync',
                [
                    '-avz',
                    '--checksum',
                    '-e',
                    `ssh -p ${serverPort}`,
                    ...options,
                    ...sources.map((source) => {
                        const absolutePath = path.resolve(root, source);

                        return source.endsWith('/') ? `${absolutePath}/` : absolutePath;
                    }),
                    `${address}:${remotePath}/${destination}`,
                ],
                { stdio: 'inherit' }
            );
        },
    };
}

type Connection = ReturnType<typeof createConnection>;
type Slot = 'blue' | 'green';

const requiredBuildSources = [
    'src',
    'public',
    'docker',
    'docker/Dockerfile',
    'docker/compose.yaml',
    'docker/nginx.conf.template',
    'docker/monitoring/config.alloy',
    'docker/monitoring/traces.alloy',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'next.config.ts',
    'postcss.config.mjs',
    'tsconfig.json',
    '.dockerignore',
] as const;

export function prepareBuildSources(root: string): void {
    for (const source of requiredBuildSources) {
        const sourcePath = path.join(root, source);
        const expectedType = source === 'src' || source === 'public' || source === 'docker' ? 'directory' : 'file';
        let valid = false;
        try {
            const stats = statSync(sourcePath);
            valid = expectedType === 'directory' ? stats.isDirectory() : stats.isFile();
        } catch {
            // Report the missing or inaccessible source with its deployment path below.
        }
        if (!valid) {
            throw new Error(
                `Required deployment ${expectedType} "${source}" is missing or has the wrong type. Restore it before deploying.`
            );
        }
    }

    // Git checkouts omit empty directories, but Dockerfile still copies this directory.
    try {
        mkdirSync(path.join(root, 'scripts/postcss'), { recursive: true });
    } catch {
        throw new Error(
            'Cannot prepare deployment directory "scripts/postcss". Ensure scripts/ is writable and scripts/postcss is a directory.'
        );
    }
}

function getDeployExcludes(): string[] {
    return readFileSync(path.resolve('.dockerignore'), 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && line !== '*' && !line.startsWith('#') && !line.startsWith('!'))
        .map((line) => {
            // These basename patterns have the same meaning in Docker and rsync.
            if (!line.startsWith('**/') || line.slice(3).includes('/')) {
                throw new Error(`Unsupported deployment exclusion in .dockerignore: ${line}`);
            }
            return `--exclude=${line.slice(3)}`;
        });
}

function isRunning(connection: Connection, name: string): boolean {
    return (
        connection.remote(
            `if test "$("$docker" inspect --format '{{.State.Running}}' ${shellQuote(name)} 2>/dev/null || true)" = true; then printf true; fi\n`
        ) === 'true'
    );
}

function isHealthy(connection: Connection, name: string): boolean {
    return (
        connection.remote(
            `if test "$("$docker" inspect --format '{{.State.Health.Status}}' ${shellQuote(name)} 2>/dev/null || true)" = healthy; then printf true; fi\n`
        ) === 'true'
    );
}

function waitHealthy(connection: Connection, name: string) {
    console.log(`⏳ Waiting for ${name} to become healthy...`);
    connection.remote(`attempt=0
while test "$attempt" -lt 60; do
    if test "$("$docker" inspect --format '{{.State.Health.Status}}' ${shellQuote(name)} 2>/dev/null || true)" = healthy; then exit 0; fi
    attempt=$((attempt + 1))
    sleep 2
done
echo ${shellQuote(`${name} did not become healthy.`)} >&2
exit 1
`);
    console.log(`✅ ${name} is healthy.`);
}

function waitGateway(connection: Connection) {
    connection.remote(`attempt=0
while test "$attempt" -lt 15; do
    if "$docker" exec rusys-gateway wget -q -O /dev/null http://127.0.0.1/ >/dev/null 2>&1; then exit 0; fi
    attempt=$((attempt + 1))
    sleep 2
done
echo 'The gateway did not serve a successful response.' >&2
exit 1
`);
}

function requireMongoAuthorization(connection: Connection) {
    // A username/password URI alone does not enforce access control on MongoDB.
    connection.remote(`if ! "$docker" exec rusys-db mongosh --quiet --eval 'try { db.getSiblingDB("admin").runCommand({serverStatus: 1}); quit(1); } catch (error) { quit(error.code === 13 ? 0 : 1); }' >/dev/null 2>&1; then
    echo 'MongoDB must reject unauthenticated serverStatus before monitoring can be deployed. Complete the approved authorization rollout first.' >&2
    exit 1
fi
`);
}

function requireMongoMonitoringSecret(connection: Connection) {
    // Resolve only the required NAS secret using Compose's own dotenv parser.
    // The quiet check neither starts a container nor prints the resolved URI.
    connection.remote(`"$docker" compose --env-file .env -f - config --quiet <<'MONGODB_MONITORING_PREFLIGHT'
services:
  monitoring-preflight:
    image: grafana/alloy:v1.20.1
    environment:
      DB_MONITORING_URI: \${DB_MONITORING_URI:?Set DB_MONITORING_URI in the NAS .env after the authorization rollout}
MONGODB_MONITORING_PREFLIGHT
`);
}

function activeSlot(connection: Connection): Slot {
    const slot =
        connection.remote(`if test -f .deploy/nginx/default.conf && grep -q 'rusys-app-blue:3000' .deploy/nginx/default.conf; then
    printf blue
elif test -f .deploy/nginx/default.conf && grep -q 'rusys-app-green:3000' .deploy/nginx/default.conf; then
    printf green
fi
`);
    if (slot !== 'blue' && slot !== 'green') {
        throw new Error('Cannot identify the active application slot.');
    }
    return slot;
}

function gatewayWorkerPids(connection: Connection): string[] {
    const output = connection.remote(`"$docker" exec rusys-gateway sh -c 'for process in /proc/[0-9]*; do
    test -r "$process/cmdline" || continue
    command=$(tr "\\000" " " < "$process/cmdline" 2>/dev/null) || continue
    case "$command" in
        "nginx: worker process"*) printf "%s\\n" "\${process##*/}" ;;
    esac
done'
`);
    const pids = output.trim().split(/\s+/).filter(Boolean);
    if (pids.length === 0 || pids.some((pid) => !/^[1-9]\d*$/.test(pid))) {
        throw new Error('Cannot identify the running Nginx workers.');
    }
    return pids;
}

function waitForGatewayWorkers(connection: Connection, pids: string[]) {
    console.log('⏳ Waiting for the previous Nginx workers to finish...');
    connection.remote(`attempt=0
while test "$attempt" -lt 180; do
    remaining=$("$docker" exec rusys-gateway sh -c 'for pid in ${pids.join(' ')}; do
        if test -d "/proc/$pid"; then printf "%s " "$pid"; fi
    done')
    if test -z "$remaining"; then exit 0; fi
    attempt=$((attempt + 1))
    sleep 2
done
echo 'Previous Nginx workers did not exit; leaving the previous application running.' >&2
exit 1
`);
}

function switchTo(connection: Connection, slot: Slot) {
    const config = readFileSync(path.resolve('docker/nginx.conf.template'), 'utf8').replaceAll(
        '@BACKEND@',
        `rusys-app-${slot}`
    );
    connection.remote(`mkdir -p .deploy/nginx
cp .deploy/nginx/default.conf .deploy/nginx/default.conf.previous
printf %s ${shellQuote(config)} > .deploy/nginx/default.conf.next
mv .deploy/nginx/default.conf.next .deploy/nginx/default.conf
`);

    try {
        connection.remote('"$docker" exec rusys-gateway nginx -t\n"$docker" exec rusys-gateway nginx -s reload\n');
        waitGateway(connection);
    } catch (error) {
        connection.remote('mv .deploy/nginx/default.conf.previous .deploy/nginx/default.conf\n');
        try {
            connection.remote('"$docker" exec rusys-gateway nginx -t\n"$docker" exec rusys-gateway nginx -s reload\n');
        } catch {
            // Preserve the original switching failure.
        }
        throw error;
    }
    connection.remote('rm -f .deploy/nginx/default.conf.previous\n');
}

export function deploy(config?: DeployConfig) {
    const connection = createConnection(getConfig(config));

    return {
        name: 'deploy',
        enforce: 'post',
        async closeBundle() {
            console.log('🚀 Starting blue-green deployment...');

            try {
                prepareBuildSources(process.cwd());
                const deployExcludes = getDeployExcludes();
                if (!isRunning(connection, 'rusys-gateway')) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('The blue-green gateway is not running.');
                }
                const previous = activeSlot(connection);
                const candidate: Slot = previous === 'blue' ? 'green' : 'blue';
                requireMongoAuthorization(connection);
                requireMongoMonitoringSecret(connection);
                connection.remote('mkdir -p src public scripts/postcss docker/monitoring\n');

                console.log('📤 Uploading source files for the Docker build...');
                connection.upload('src/', ['src/'], ['--delete', '--delete-excluded', ...deployExcludes]);
                connection.upload('public/', ['public/'], ['--delete', '--delete-excluded', ...deployExcludes]);
                connection.upload(
                    'scripts/postcss/',
                    ['scripts/postcss/'],
                    ['--delete', '--delete-excluded', ...deployExcludes]
                );
                connection.upload(
                    'docker/',
                    ['docker/'],
                    [
                        '--delete',
                        '--delete-excluded',
                        '--include=/Dockerfile',
                        '--include=/compose.yaml',
                        '--include=/nginx.conf.template',
                        '--include=/monitoring/***',
                        '--exclude=*',
                    ]
                );
                connection.upload('', [
                    'package.json',
                    'pnpm-lock.yaml',
                    'pnpm-workspace.yaml',
                    'next.config.ts',
                    'postcss.config.mjs',
                    'tsconfig.json',
                    '.dockerignore',
                ]);

                connection.remote('"$docker" compose --env-file .env -f docker/compose.yaml config --quiet\n');
                connection.remote(
                    '"$docker" compose --env-file .env -f docker/compose.yaml run --rm --no-deps monitoring validate /etc/alloy/config.alloy\n'
                );
                connection.remote(
                    '"$docker" compose --env-file .env -f docker/compose.yaml run --rm --no-deps traces-validate\n'
                );
                connection.remote(
                    '"$docker" compose --env-file .env -f docker/compose.yaml up -d --no-deps --force-recreate traces\n'
                );
                if (!isRunning(connection, 'rusys-traces')) {
                    throw new Error('The traces collector is not running. Check its Alloy configuration.');
                }
                connection.remote(
                    '"$docker" compose --env-file .env -f docker/compose.yaml up -d --no-deps rusys-db\n'
                );
                waitHealthy(connection, 'rusys-db');
                requireMongoAuthorization(connection);
                connection.remote(
                    '"$docker" compose --env-file .env -f docker/compose.yaml up -d --no-deps --force-recreate monitoring\n'
                );
                if (!isRunning(connection, 'rusys-monitoring')) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('The monitoring container is not running. Check its Alloy configuration and logs.');
                }
                console.log(`🔨 Building rusys-app-${candidate} on the server...`);
                connection.remote(
                    `"$docker" compose --env-file .env -f docker/compose.yaml build rusys-app-${candidate}\n`,
                    true
                );
                console.log(`🚀 Starting rusys-app-${candidate}...`);
                connection.remote(
                    `"$docker" compose --env-file .env -f docker/compose.yaml up -d --no-deps --no-build --force-recreate rusys-app-${candidate}\n`
                );
                waitHealthy(connection, `rusys-app-${candidate}`);
                const previousWorkers = gatewayWorkerPids(connection);
                switchTo(connection, candidate);
                waitForGatewayWorkers(connection, previousWorkers);
                connection.remote(`if ! grep -q ${shellQuote(`rusys-app-${candidate}:3000`)} .deploy/nginx/default.conf; then
    echo 'The active application slot changed before the previous container could be stopped.' >&2
    exit 1
fi
"$docker" compose --env-file .env -f docker/compose.yaml stop rusys-app-${previous}
`);
                console.log(`Active application slot: ${candidate}`);
                console.log('✅ Deployment completed successfully!');
            } catch (error) {
                console.error('❌ Deployment failed!', error);
                process.exit(1);
            }
        },
    };
}

export function rollback(config?: DeployConfig) {
    const connection = createConnection(getConfig(config));

    return {
        name: 'deploy-rollback',
        enforce: 'post',
        async closeBundle() {
            console.log('↩️  Switching back to the previous application...');

            try {
                if (!isRunning(connection, 'rusys-gateway')) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('The blue-green gateway is not running.');
                }
                const previous: Slot = activeSlot(connection) === 'blue' ? 'green' : 'blue';
                if (isHealthy(connection, `rusys-app-${previous}`)) {
                    switchTo(connection, previous);
                    console.log(`Rolled back to application slot: ${previous}`);
                } else {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('No healthy previous application is available.');
                }
                console.log('✅ Rollback completed successfully!');
            } catch (error) {
                console.error('❌ Rollback failed!', error);
                process.exit(1);
            }
        },
    };
}
