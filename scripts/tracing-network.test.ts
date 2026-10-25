import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

// Disposable Docker resources; no NAS connection or Cloud credentials.
describe.skipIf(process.env.RUN_DOCKER_TESTS !== '1')('private OTLP path', () => {
    it('accepts slot traffic only on its private interface and publishes no host ports', () => {
        const prefix = `rusys-tracing-test-${process.pid}`;
        const network = `${prefix}-private`;
        const egress = `${prefix}-egress`;
        const collector = `${prefix}-alloy`;
        const privateIp = '172.30.98.2';
        const docker = (...args: string[]) => execFileSync('docker', args, { encoding: 'utf8', stdio: 'pipe' }).trim();
        const composeEnvironment = { ...process.env };
        for (const match of readFileSync('docker/compose.yaml', 'utf8').matchAll(/\$\{(\w+):\?/g)) {
            composeEnvironment[match[1]] = 'fixture';
        }
        composeEnvironment.GC_OTLP_ENDPOINT = 'https://example.invalid/otlp';
        composeEnvironment.DOCKER_ROOT_DIR = '/tmp';
        const compose = (...args: string[]) =>
            execFileSync(
                'docker',
                ['compose', '--env-file', '/dev/null', '-p', prefix, '-f', 'docker/compose.yaml', ...args],
                { env: composeEnvironment, encoding: 'utf8', stdio: 'pipe' }
            ).trim();
        const probe = (bridge: string, endpoint: string, success: boolean) =>
            docker(
                'run',
                '--rm',
                '--network',
                bridge,
                'node:26-alpine',
                'node',
                '-e',
                `fetch('http://${endpoint}:4318/v1/traces', {method:'POST',headers:{'content-type':'application/json'},body:'{"resourceSpans":[]}',signal:AbortSignal.timeout(2000)}).then(r=>process.exit(${success} && r.ok ? 0 : 1)).catch(()=>process.exit(${success} ? 1 : 0))`
            );
        try {
            docker('network', 'create', '--internal', '--subnet', '172.30.98.0/24', network);
            docker('network', 'create', egress);
            docker(
                'create',
                '--name',
                collector,
                '--network',
                network,
                '--ip',
                privateIp,
                '-v',
                `${path.resolve('docker/monitoring/traces.alloy')}:/etc/alloy/traces.alloy:ro`,
                '-e',
                `OTLP_LISTEN_ADDRESS=${privateIp}:4318`,
                '-e',
                'GC_OTLP_ENDPOINT=https://example.invalid/otlp',
                '-e',
                'GC_OTLP_USER=fixture',
                '-e',
                'GC_OTLP_TOKEN=fixture',
                'grafana/alloy:v1.20.1',
                'run',
                '--server.http.listen-addr=127.0.0.1:12345',
                '/etc/alloy/traces.alloy'
            );
            docker('network', 'connect', egress, collector);
            docker('start', collector);

            // A networkless validator must work while a receiver is already running.
            expect(() => compose('run', '--rm', '--no-deps', 'traces-validate')).not.toThrow();

            const resolved = JSON.parse(
                compose('--profile', 'tools', '--profile', 'blue', '--profile', 'green', 'config', '--format', 'json')
            );

            expect({
                validationNetwork: resolved.services['traces-validate'].network_mode,
                privateNetwork: resolved.networks['traces-private'].internal,
                collectorPorts: resolved.services.traces.ports,
                privateMembers: Object.entries(resolved.services)
                    .filter(([, service]) =>
                        Object.keys((service as { networks?: object }).networks ?? {}).includes('traces-private')
                    )
                    .map(([name]) => name)
                    .sort(),
            }).toStrictEqual({
                validationNetwork: 'none',
                privateNetwork: true,
                collectorPorts: undefined,
                privateMembers: ['rusys-app-blue', 'rusys-app-green', 'traces'],
            });

            // Docker exec readiness needs no published diagnostic port.
            let ready = false;
            let probeError: unknown;
            for (let attempt = 0; attempt < 20; attempt++) {
                try {
                    probe(network, privateIp, true);
                    ready = true;
                    break;
                } catch (error) {
                    probeError = error;
                    /* bounded retry */
                }
            }

            if (!ready) {
                const logs = spawnSync('docker', ['logs', collector], { encoding: 'utf8' });
                throw new Error(
                    `Private receiver did not accept OTLP: ${String(probeError)} ${logs.stdout} ${logs.stderr}`
                );
            }

            const egressIp = docker(
                'inspect',
                '--format',
                `{{(index .NetworkSettings.Networks "${egress}").IPAddress}}`,
                collector
            );

            expect(() => probe(egress, egressIp, false)).not.toThrow();
            expect(docker('inspect', '--format', '{{json .HostConfig.PortBindings}}', collector)).toBe('{}');
            expect(docker('network', 'inspect', '--format', '{{.Internal}}', network)).toBe('true');
        } finally {
            spawnSync('docker', ['rm', '-f', collector], { encoding: 'utf8' });
            spawnSync('docker', ['network', 'rm', network, egress], { encoding: 'utf8' });
        }
    }, 90_000);
});
