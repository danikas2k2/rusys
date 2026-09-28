import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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
        remote(script: string) {
            return execFileSync('ssh', ['-p', serverPort, address, 'sh', '-s'], {
                input: remoteHeader + script,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'inherit'],
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
    connection.remote(`attempt=0
while test "$attempt" -lt 60; do
    if test "$("$docker" inspect --format '{{.State.Health.Status}}' ${shellQuote(name)} 2>/dev/null || true)" = healthy; then exit 0; fi
    attempt=$((attempt + 1))
    sleep 2
done
echo ${shellQuote(`${name} did not become healthy.`)} >&2
exit 1
`);
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

function restoreConfig(connection: Connection, hadPrevious: boolean) {
    connection.remote(
        hadPrevious
            ? 'mv .deploy/nginx/default.conf.previous .deploy/nginx/default.conf\n'
            : 'rm -f .deploy/nginx/default.conf\n'
    );
}

function switchTo(connection: Connection, slot: Slot) {
    const config = readFileSync(path.resolve('docker/nginx.conf.template'), 'utf8').replaceAll(
        '@BACKEND@',
        `rusys-app-${slot}`
    );
    const hadPrevious = connection.remote('if test -f .deploy/nginx/default.conf; then printf true; fi\n') === 'true';
    connection.remote(`mkdir -p .deploy/nginx
${hadPrevious ? 'cp .deploy/nginx/default.conf .deploy/nginx/default.conf.previous' : ':'}
printf %s ${shellQuote(config)} > .deploy/nginx/default.conf.next
mv .deploy/nginx/default.conf.next .deploy/nginx/default.conf
`);

    if (isRunning(connection, 'rusys-gateway')) {
        try {
            connection.remote('"$docker" exec rusys-gateway nginx -t\n"$docker" exec rusys-gateway nginx -s reload\n');
            waitGateway(connection);
        } catch (error) {
            restoreConfig(connection, hadPrevious);
            try {
                connection.remote('"$docker" exec rusys-gateway nginx -s reload\n');
            } catch {
                // Preserve the original switching failure.
            }
            throw error;
        }
    } else {
        const legacyWasRunning = isRunning(connection, 'rusys-app');
        try {
            if (legacyWasRunning) {
                connection.remote('"$docker" stop rusys-app\n');
            }
            connection.remote(
                '"$docker" compose --env-file .env -f docker/compose.yaml up -d --no-deps --no-build rusys-gateway\n'
            );
            waitGateway(connection);
        } catch (error) {
            connection.remote('"$docker" stop rusys-gateway >/dev/null 2>&1 || true\n');
            if (legacyWasRunning) {
                connection.remote('"$docker" start rusys-app\n');
            }
            restoreConfig(connection, hadPrevious);
            throw error;
        }
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
                const gatewayRunning = isRunning(connection, 'rusys-gateway');
                const candidate: Slot = gatewayRunning
                    ? activeSlot(connection) === 'blue'
                        ? 'green'
                        : 'blue'
                    : 'blue';
                connection.remote('mkdir -p src public scripts/postcss docker\n');

                console.log('📤 Uploading source files for the Docker build...');
                connection.upload(
                    'src/',
                    ['src/'],
                    [
                        '--delete',
                        '--delete-excluded',
                        '--exclude=*.test.ts',
                        '--exclude=*.test.tsx',
                        '--exclude=*.spec.ts',
                        '--exclude=*.snap.ts',
                        '--exclude=__mocks__/',
                        '--exclude=tests/',
                    ]
                );
                connection.upload('public/', ['public/'], ['--delete']);
                connection.upload('scripts/postcss/', ['scripts/postcss/'], ['--delete']);
                connection.upload('docker/', ['docker/'], ['--delete']);
                connection.upload('', [
                    'package.json',
                    'pnpm-lock.yaml',
                    'pnpm-workspace.yaml',
                    'next.config.ts',
                    'postcss.config.mjs',
                    'tsconfig.json',
                    '.dockerignore',
                ]);

                connection.remote(
                    '"$docker" compose --env-file .env -f docker/compose.yaml up -d --no-deps rusys-db\n'
                );
                waitHealthy(connection, 'rusys-db');
                if (!gatewayRunning) {
                    connection.remote('"$docker" compose --env-file .env -f docker/compose.yaml pull rusys-gateway\n');
                }
                connection.remote(
                    `"$docker" compose --env-file .env -f docker/compose.yaml build rusys-app-${candidate}\n`
                );
                connection.remote(
                    `"$docker" compose --env-file .env -f docker/compose.yaml up -d --no-deps --no-build --force-recreate rusys-app-${candidate}\n`
                );
                waitHealthy(connection, `rusys-app-${candidate}`);
                switchTo(connection, candidate);
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
                    throw new Error('The blue-green gateway is not running.');
                }
                const previous: Slot = activeSlot(connection) === 'blue' ? 'green' : 'blue';
                if (isHealthy(connection, `rusys-app-${previous}`)) {
                    switchTo(connection, previous);
                    console.log(`Rolled back to application slot: ${previous}`);
                } else if (
                    connection.remote('if "$docker" inspect rusys-app >/dev/null 2>&1; then printf true; fi\n') ===
                    'true'
                ) {
                    connection.remote('"$docker" stop rusys-gateway\n');
                    try {
                        connection.remote('"$docker" start rusys-app\n');
                        console.log('Rolled back to the pre-gateway application.');
                    } catch (error) {
                        connection.remote('"$docker" start rusys-gateway\n');
                        throw error;
                    }
                } else {
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
