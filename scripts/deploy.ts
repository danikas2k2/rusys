import { execFileSync } from 'node:child_process';
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

    return { serverUser, serverHost, serverPort, remotePath, backupPath, dockerPath };
}

function shellQuote(value: string): string {
    return `'${value.replaceAll("'", "'\\''")}'`;
}

function createConnection(config: Required<DeployConfig>) {
    const { serverUser, serverHost, serverPort, remotePath, backupPath, dockerPath } = config;
    const address = `${serverUser}@${serverHost}`;
    const root = path.resolve(process.cwd());
    const remoteHeader = `set -eu
cd ${shellQuote(remotePath)}
backup=${shellQuote(backupPath)}
docker=${shellQuote(dockerPath)}
`;

    return {
        remote(script: string) {
            execFileSync('ssh', ['-p', serverPort, address, 'sh', '-s'], {
                input: remoteHeader + script,
                stdio: ['pipe', 'inherit', 'inherit'],
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

export function deploy(config?: DeployConfig) {
    const connection = createConnection(getConfig(config));

    return {
        name: 'deploy',
        enforce: 'post',
        configResolved() {},
        async closeBundle() {
            console.log('🚀 Starting deployment...');

            try {
                // Back up the release before rsync replaces any source files.
                console.log('💾 Backing up the current release...');
                connection.remote(`backup_next="\${backup}.next"
rm -rf "$backup_next"
mkdir -p "$backup_next"
if test -d src && test -d public && test -d scripts/postcss && test -f pnpm-lock.yaml && test -d docker; then
    mkdir -p "$backup_next/scripts"
    cp -a src public "$backup_next/"
    cp -a scripts/postcss "$backup_next/scripts/"
    cp -a docker "$backup_next/docker"
    cp package.json pnpm-lock.yaml pnpm-workspace.yaml next.config.ts postcss.config.mjs tsconfig.json "$backup_next/"
    printf source > "$backup_next/layout"
elif "$docker" container inspect rusys-app >/dev/null 2>&1 && test -d dist && test -f compose.yaml && test -f Dockerfile; then
    cp -a dist "$backup_next/dist"
    cp compose.yaml Dockerfile "$backup_next/"
    printf legacy > "$backup_next/layout"
elif test -d dist && test -d docker; then
    cp -a dist docker "$backup_next/"
    printf monorepo > "$backup_next/layout"
else
    echo 'Cannot identify the current deployment layout.' >&2
    rm -rf "$backup_next"
    exit 1
fi
if test -d public && ! test -d "$backup_next/public"; then cp -a public "$backup_next/public"; fi
if test -f .dockerignore; then cp .dockerignore "$backup_next/.dockerignore"; fi
rm -rf "$backup"
mv "$backup_next" "$backup"
mkdir -p src public scripts/postcss docker
`);

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

                console.log('🐳 Building and restarting containers...');
                connection.remote(`"$docker" compose --env-file .env -f docker/compose.yaml build rusys-app
if test -f compose.yaml && test -f Dockerfile && "$docker" container inspect rusys-app >/dev/null 2>&1; then
    "$docker" compose --env-file .env -f compose.yaml down
fi
"$docker" compose --env-file .env -f docker/compose.yaml up -d --no-build --remove-orphans
rm -rf dist
rm -f compose.yaml Dockerfile
`);

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
            console.log('↩️  Rolling back deployment...');

            try {
                connection.remote(`if ! test -f "$backup/layout"; then
    echo 'No valid deployment backup found.' >&2
    exit 1
fi
if test -f "$backup/.dockerignore"; then cp "$backup/.dockerignore" .dockerignore; else rm -f .dockerignore; fi
if test -d "$backup/public"; then rm -rf public; cp -a "$backup/public" ./public; fi
if test "$(cat "$backup/layout")" = source && test -d "$backup/src" && test -d "$backup/docker"; then
    rm -rf src scripts/postcss docker dist
    mkdir -p scripts
    cp -a "$backup/src" ./src
    cp -a "$backup/scripts/postcss" ./scripts/postcss
    cp -a "$backup/docker" ./docker
    cp "$backup/package.json" "$backup/pnpm-lock.yaml" "$backup/pnpm-workspace.yaml" "$backup/next.config.ts" "$backup/postcss.config.mjs" "$backup/tsconfig.json" ./
    "$docker" compose --env-file .env -f docker/compose.yaml build rusys-app
    "$docker" compose --env-file .env -f docker/compose.yaml up -d --no-build --remove-orphans
elif test "$(cat "$backup/layout")" = monorepo && test -d "$backup/dist" && test -d "$backup/docker"; then
    rm -rf src scripts/postcss dist docker
    cp -a "$backup/dist" ./dist
    cp -a "$backup/docker" ./docker
    "$docker" compose --env-file .env -f docker/compose.yaml up -d --build
elif test "$(cat "$backup/layout")" = legacy && test -d "$backup/dist" && test -f "$backup/compose.yaml" && test -f "$backup/Dockerfile"; then
    "$docker" compose --env-file .env -f docker/compose.yaml down
    rm -rf src scripts/postcss dist docker
    cp -a "$backup/dist" ./dist
    cp "$backup/compose.yaml" "$backup/Dockerfile" ./
    "$docker" compose --env-file .env -f compose.yaml up -d --build
else
    echo 'No valid deployment backup found.' >&2
    exit 1
fi
`);

                console.log('✅ Rollback completed successfully!');
            } catch (error) {
                console.error('❌ Rollback failed!', error);
                process.exit(1);
            }
        },
    };
}
