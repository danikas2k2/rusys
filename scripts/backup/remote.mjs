import { spawnSync } from 'node:child_process';

const { DEPLOY_USER, DEPLOY_HOST, DEPLOY_PORT = '22', DEPLOY_PATH, BACKUP_CONFIG_PATH } = process.env;

const [action, snapshot = 'latest'] = process.argv.slice(2);

const required = {
    DEPLOY_USER,
    DEPLOY_HOST,
    DEPLOY_PATH,
    BACKUP_CONFIG_PATH,
};

for (const [name, value] of Object.entries(required)) {
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
}

if (!/^[a-zA-Z0-9_.-]+$/.test(DEPLOY_USER) || !/^[a-zA-Z0-9_.:-]+$/.test(DEPLOY_HOST) || !/^\d+$/.test(DEPLOY_PORT)) {
    throw new Error('Invalid SSH connection settings');
}

if (!DEPLOY_PATH.startsWith('/') || !BACKUP_CONFIG_PATH.startsWith('/')) {
    throw new Error('Remote paths must be absolute');
}

if (!['list', 'restore'].includes(action)) {
    throw new Error('Usage: backup:list | backup:restore [ID|latest]');
}

if (action === 'restore' && snapshot !== 'latest' && !/^[a-fA-F0-9]{8,64}$/.test(snapshot)) {
    throw new Error('Invalid Restic snapshot ID');
}

// Escape individual arguments for the remote POSIX shell.
const quote = (value) => `'${String(value).replaceAll("'", "'\\''")}'`;

const script = `${DEPLOY_PATH}/scripts/backup/restic.sh`;

const args = [quote(script), quote(BACKUP_CONFIG_PATH)];

let command;

if (action === 'list') {
    command = ['sh', ...args, 'snapshots', '--long'].join(' ');
} else {
    // Use a unique directory for every restore operation.
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');

    const target = `/backup/work/restore/manual-${timestamp}`;

    command = ['sh', ...args, 'restore', quote(snapshot), '--target', quote(target)].join(' ');

    console.log(`Restoring snapshot: ${snapshot}`);
    console.log(`Container target: ${target}`);
    console.log('Production data will not be overwritten.\n');
}

const result = spawnSync('ssh', ['-p', DEPLOY_PORT, `${DEPLOY_USER}@${DEPLOY_HOST}`, command], {
    stdio: 'inherit',
});

if (result.error) {
    console.error(result.error.message);
}

process.exit(result.status ?? 1);
