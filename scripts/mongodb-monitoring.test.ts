import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const alloy = readFileSync('docker/monitoring/config.alloy', 'utf8');

// Uses disposable containers only. No NAS access or Grafana credentials.
describe.skipIf(process.env.RUN_DOCKER_TESTS !== '1')('mongoDB monitoring security and discovery', () => {
    it('collects connections/operations with clusterMonitor, rejects application access, and follows a new bridge IP', async () => {
        const directory = mkdtempSync(path.join(tmpdir(), 'rusys-mongodb-monitoring-'));
        const prefix = `rusys-mongodb-test-${process.pid}`;
        const database = `${prefix}-db`;
        const monitoring = `${prefix}-alloy`;
        const network = `${prefix}-net`;
        const docker = (...args: string[]) =>
            execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        // A supplied external host/options must never redirect the private connection.
        // Reserved credential characters must survive decoding and re-encoding.
        const uri =
            'mongodb://monitor:fixture%3Ap%40ss%2Fword%20%2B@public.example:27017/admin?appName=@rusys-db:27017/x';
        const pipeline = alloy
            .slice(
                alloy.indexOf('// Host networking has no Compose DNS.'),
                alloy.indexOf('prometheus.remote_write "grafana_cloud"')
            )
            .replace('regex         = "/rusys-db"', `regex         = "/${database}"`)
            .replace('rusys-app_rusys-net;27017', `${network};27017`);
        const config = `${pipeline}\nprometheus.remote_write "grafana_cloud" {\n  endpoint { url = "http://127.0.0.1:1/api/v1/write" }\n}\n`;
        writeFileSync(path.join(directory, 'config.alloy'), config);
        const mount = `${directory}:/fixtures:ro`;
        const waitFor = async (check: () => boolean | Promise<boolean>, message: string) => {
            const deadline = Date.now() + 45_000;
            while (Date.now() < deadline) {
                if (await check()) {
                    return;
                }
                await new Promise((resolve) => setTimeout(resolve, 250));
            }
            const logs = spawnSync('docker', ['logs', monitoring], { encoding: 'utf8' });
            throw new Error(`${message}\n${logs.stdout.slice(-2000)}${logs.stderr.slice(-4000)}`);
        };
        try {
            docker('network', 'create', network);
            docker(
                'run',
                '-d',
                '--name',
                monitoring,
                '--network',
                network,
                '-p',
                '127.0.0.1::12345',
                '-v',
                mount,
                '-v',
                '/var/run/docker.sock:/var/run/docker.sock:ro',
                '-e',
                `MONGODB_MONITORING_URI=${uri}`,
                'grafana/alloy:v1.20.1',
                'run',
                '--server.http.listen-addr=0.0.0.0:12345',
                '/fixtures/config.alloy'
            );
            const port = docker(
                'inspect',
                '--format',
                '{{(index (index .NetworkSettings.Ports "12345/tcp") 0).HostPort}}',
                monitoring
            );
            const metrics = async () => {
                try {
                    const response = await fetch(
                        `http://127.0.0.1:${port}/api/v0/component/prometheus.exporter.mongodb.rusys/metrics`,
                        { signal: AbortSignal.timeout(5000) }
                    );

                    expect(response.status).toBe(200);

                    return await response.text();
                } catch {
                    return '';
                }
            };
            await waitFor(async () => {
                const value = await metrics();
                return /mongodb_up(?:\{[^}]*\})? 0/.test(value);
            }, 'Exporter did not start without a database');
            docker(
                'run',
                '-d',
                '--name',
                database,
                '--network',
                network,
                '--label',
                'com.docker.compose.project=rusys-app',
                '--label',
                'com.docker.compose.service=rusys-db',
                '-e',
                'MONGO_INITDB_ROOT_USERNAME=root',
                '-e',
                'MONGO_INITDB_ROOT_PASSWORD=root-fixture',
                'mongo:8',
                '--bind_ip_all'
            );
            const admin = (code: string) =>
                docker(
                    'exec',
                    database,
                    'mongosh',
                    '--quiet',
                    '--username',
                    'root',
                    '--password',
                    'root-fixture',
                    '--authenticationDatabase',
                    'admin',
                    '--eval',
                    code
                );
            await waitFor(() => {
                try {
                    return admin('db.adminCommand({ping:1}).ok') === '1';
                } catch {
                    return false;
                }
            }, 'Authenticated MongoDB did not become ready');
            admin(
                'db.getSiblingDB("admin").createUser({user:"monitor",pwd:"fixture:p@ss/word +",roles:[{role:"clusterMonitor",db:"admin"}]})'
            );
            const unauthenticatedProbe =
                'try { db.getSiblingDB("admin").runCommand({serverStatus: 1}); quit(1); } catch (error) { quit(error.code === 13 ? 0 : 1); }';

            expect(() => docker('exec', database, 'mongosh', '--quiet', '--eval', unauthenticatedProbe)).not.toThrow();

            const monitor = (code: string) =>
                docker(
                    'exec',
                    database,
                    'mongosh',
                    '--quiet',
                    '--username',
                    'monitor',
                    '--password',
                    'fixture:p@ss/word +',
                    '--authenticationDatabase',
                    'admin',
                    '--eval',
                    code
                );

            expect(monitor('db.getSiblingDB("admin").runCommand({serverStatus:1}).ok')).toBe('1');
            expect(monitor('db.getSiblingDB("admin").runCommand({getDiagnosticData:1}).ok')).toBe('1');

            for (const command of [
                '{find:"products",filter:{},limit:1}',
                '{insert:"monitoring_test",documents:[{test:true}]}',
            ]) {
                expect(() => monitor(`db.getSiblingDB("rusys").runCommand(${command})`)).toThrow(
                    /requires authentication|not authorized/
                );
            }

            expect(() =>
                docker(
                    'exec',
                    database,
                    'mongosh',
                    '--quiet',
                    '--username',
                    'monitor',
                    '--password',
                    'wrong',
                    '--authenticationDatabase',
                    'admin',
                    '--eval',
                    'db.adminCommand({ping:1})'
                )
            ).toThrow(/Authentication failed/);

            const checkMetrics = async () => {
                const value = await metrics();
                return (
                    /mongodb_up(?:\{[^}]*\})? 1/.test(value) &&
                    value.includes('mongodb_ss_connections') &&
                    value.includes('mongodb_ss_opcounters')
                );
            };
            await waitFor(checkMetrics, 'Missing connection or operation metrics with clusterMonitor');
            const collected = await metrics();

            expect(collected).toMatch(/mongodb_ss_connections\{[^}]*conn_type="current"/);
            expect(collected).toMatch(/mongodb_ss_opcounters\{[^}]*legacy_op_type=/);

            const oldAddress = docker(
                'inspect',
                '--format',
                `{{(index .NetworkSettings.Networks "${network}").IPAddress}}`,
                database
            );
            const newAddress = oldAddress.replace(/\d+$/, '240');
            docker('network', 'disconnect', network, database);
            await waitFor(
                async () => /mongodb_up(?:\{[^}]*\})? 0/.test(await metrics()),
                'Disconnected database should be unavailable'
            );
            docker('network', 'connect', '--ip', newAddress, network, database);
            await waitFor(checkMetrics, 'Exporter did not follow the changed private bridge IP');

            expect(docker('inspect', '--format', '{{json .HostConfig.PortBindings}}', database)).toBe('{}');

            const logs = spawnSync('docker', ['logs', monitoring], { encoding: 'utf8' });

            expect(logs.stdout + logs.stderr).not.toContain('fixture:p@ss/word +');
            expect(logs.stdout + logs.stderr).not.toContain('fixture%3Ap%40ss%2Fword%20%2B');
        } finally {
            try {
                // One missing container must not prevent cleanup of the other resources.
                spawnSync('docker', ['rm', '-f', monitoring, database], { encoding: 'utf8' });
                docker('network', 'rm', network);
            } finally {
                rmSync(directory, { recursive: true, force: true });
            }
        }
    }, 150_000);
});
