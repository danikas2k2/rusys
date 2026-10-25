import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const nginx = readFileSync('docker/nginx.conf.template', 'utf8');
const alloy = readFileSync('docker/monitoring/config.alloy', 'utf8');
const expression = alloy.match(/expression = `([^`]*\?P<safe_gateway>[^`]*)`/)!;
const gatewayPattern = new RegExp(expression[1].replace('?P<', '?<'));
const pathPattern = new RegExp(nginx.match(/"~([^"\n]*)" \$uri;/)![1].replace('\\\\z', '$(?![\\s\\S])'));

const entry = {
    time: '2026-10-25T12:00:00+00:00',
    method: 'GET',
    uri: '/api/health',
    status: 200,
    request_time: 0.125,
    upstream_response_time: '0.123',
    upstream_connect_time: '0.001',
    upstream_header_time: '0.122',
    upstream_addr: '172.20.0.4:3000',
    bytes_sent: 15,
};

function line(overrides: Partial<typeof entry> = {}) {
    // NGINX emits request_time with three fractional digits, even when zero.
    const value = { ...entry, ...overrides };
    return JSON.stringify(value).replace(/"request_time":[0-9.]+/, `"request_time":${value.request_time.toFixed(3)}`);
}

describe('nGINX privacy boundary', () => {
    it.each(['/', '/api/health', '/images/item.png', '/groups/example'])('allows path %s', (uri) => {
        expect(pathPattern.test(uri)).toBe(true);
        expect(gatewayPattern.test(line({ uri }))).toBe(true);
    });

    it.each([
        '/health?token=secret',
        '/health\nsecret',
        '/health\n',
        '/health\rsecret',
        '/health"secret',
        '/health\\secret',
        '/health%3Ftoken=secret',
        '/health%0Asecret',
        `/${'a'.repeat(2048)}`,
    ])('redacts unsafe or oversized path %s', (uri) => {
        expect(pathPattern.test(uri)).toBe(false);
        expect(gatewayPattern.test(line({ uri }))).toBe(false);
    });

    it.each([
        { status: 204, request_time: 0, upstream_response_time: '-', upstream_addr: '-' },
        { status: 502, upstream_response_time: '0.001, 0.123 : -', upstream_addr: '172.20.0.4:3000, [::1]:3000' },
        { status: 499, method: 'UNKNOWN', request_time: 12345.678 },
    ])('retains diagnostic values including missing/retried upstreams: %j', (fields) => {
        expect(gatewayPattern.test(line(fields))).toBe(true);
    });

    it.each([
        '{"message":"Authorization: Bearer secret"}',
        '127.0.0.1 - - "GET /?token=secret HTTP/1.1" 200 15',
        '2026/10/25 [error] request: "GET /?token=secret HTTP/1.1"',
        `${line().slice(0, -1)},"cookie":"secret"}`,
        `${line()}\nsecret`,
        line({ method: 'SECRET' }),
        line({ status: 999 }),
        line({ upstream_addr: 'user:password@host' }),
        line({ upstream_response_time: 'session=secret' }),
    ])('rejects raw, augmented or untrusted records: %s', (value) => {
        expect(gatewayPattern.test(value)).toBe(false);
    });
});

// Run explicitly with RUN_DOCKER_TESTS=1 pnpm exec vitest run scripts/nginx-logging.test.ts.
describe.skipIf(process.env.RUN_DOCKER_TESTS !== '1')('real NGINX access logs', () => {
    it('validates before startup and emits one private JSON line per request', async () => {
        const directory = mkdtempSync(path.join(tmpdir(), 'rusys-nginx-logging-'));
        const name = `rusys-nginx-logging-${process.pid}`;
        const docker = (...args: string[]) =>
            execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        try {
            writeFileSync(
                path.join(directory, 'default.conf'),
                nginx.replaceAll('@BACKEND@', '127.0.0.1').replace('location / {', 'location / {\n        return 204;')
            );
            const mount = `${directory}:/etc/nginx/conf.d:ro`;
            docker('run', '--rm', '-v', mount, 'nginx:stable-alpine', 'nginx', '-t');
            docker('run', '-d', '--name', name, '-v', mount, '-p', '127.0.0.1::80', 'nginx:stable-alpine');
            const port = docker(
                'inspect',
                '--format',
                '{{(index (index .NetworkSettings.Ports "80/tcp") 0).HostPort}}',
                name
            ).trim();
            for (const uri of [
                '/health?token=query-secret',
                '/health%3Ftoken=encoded-secret?cookie=query-secret',
                '/health%0Acontrol-secret',
                '/health%0A',
                '/health%253Ftoken=double-secret',
            ]) {
                const response = await fetch(`http://127.0.0.1:${port}${uri}`, {
                    headers: { Authorization: 'Bearer auth-secret', Cookie: 'session=cookie-secret' },
                });

                expect(response.status).toBe(204);
            }
            const output = docker('logs', name);
            const lines = output.split('\n').filter((value) => value.startsWith('{'));

            expect(lines).toHaveLength(5);
            expect(lines.map((value: string) => (JSON.parse(value) as { uri: string }).uri)).toStrictEqual([
                '/health',
                '/redacted',
                '/redacted',
                '/redacted',
                '/redacted',
            ]);

            for (const value of lines) {
                expect(gatewayPattern.test(value)).toBe(true);
                expect(value).not.toMatch(/secret|token|session|cookie|Authorization|\?/i);
            }
        } finally {
            try {
                docker('rm', '-f', name);
            } finally {
                rmSync(directory, { recursive: true, force: true });
            }
        }
    }, 30_000);
});

describe.skipIf(process.env.RUN_DOCKER_TESTS !== '1')('real Alloy gateway privacy pipeline', () => {
    it('starts the actual pipeline and preserves diagnostics while redacting unsafe records', async () => {
        const directory = mkdtempSync(path.join(tmpdir(), 'rusys-gateway-alloy-'));
        const name = `rusys-gateway-alloy-${process.pid}`;
        const docker = (...args: string[]) =>
            execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        const safe = [
            line(),
            line({ status: 404, request_time: 0, upstream_response_time: '-', upstream_addr: '-' }),
            line({
                status: 502,
                upstream_response_time: '0.001, 0.123 : -',
                upstream_addr: '[::1]:3000, 172.20.0.4:3000',
            }),
        ];
        const unsafe = [
            line({ uri: '/health?token=PRIVACY_CANARY' }),
            line({ uri: '/health%3Ftoken=PRIVACY_CANARY' }),
            line({ uri: '/health\nPRIVACY_CANARY' }),
            `${line().slice(0, -1)},"authorization":"PRIVACY_CANARY"}`,
            line({ upstream_addr: 'PRIVACY_CANARY' }),
            'nginx error request: "GET /?session=PRIVACY_CANARY HTTP/1.1"',
        ];
        try {
            const pipeline = alloy
                .slice(alloy.indexOf('loki.process "rusys_privacy"'), alloy.indexOf('loki.write "grafana_cloud"'))
                .replace('loki.write.grafana_cloud.receiver', 'loki.echo.test.receiver');
            writeFileSync(path.join(directory, 'gateway.log'), [...safe, ...unsafe, ''].join('\n'));
            writeFileSync(
                path.join(directory, 'config.alloy'),
                `${pipeline}
loki.echo "test" {}
loki.source.file "test" {
  targets = [{__path__="/fixtures/gateway.log", service_name="rusys-gateway", container="rusys-gateway", project="rusys", injected_secret="PRIVACY_CANARY"}]
  forward_to = [loki.process.rusys_privacy.receiver]
}
`
            );
            docker(
                'run',
                '-d',
                '--name',
                name,
                '-v',
                `${directory}:/fixtures:ro`,
                'grafana/alloy:v1.20.1',
                'run',
                '/fixtures/config.alloy'
            );
            const readOutput = () => {
                const result = spawnSync('docker', ['logs', name], { encoding: 'utf8' });
                return result.stdout + result.stderr;
            };
            const deadline = Date.now() + 15_000;
            while (
                (readOutput().match(/gateway_output_redacted/g)?.length ?? 0) < unsafe.length &&
                Date.now() < deadline
            ) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            const output = readOutput();
            for (const value of safe) {
                expect(output).toContain(JSON.stringify(value));
            }

            expect(output.match(/gateway_output_redacted/g)).toHaveLength(unsafe.length);
            expect(output).not.toContain('PRIVACY_CANARY');
            expect(output).not.toContain('injected_secret');
        } finally {
            try {
                docker('rm', '-f', name);
            } finally {
                rmSync(directory, { recursive: true, force: true });
            }
        }
    }, 30_000);
});
