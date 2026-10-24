import { readFileSync } from 'node:fs';
import { stderr, stdout } from 'node:process';

import type { MockInstance } from 'vitest';

import { onRequestError, register } from '~/instrumentation';
import { installConsoleLogging, logEvent } from '~/server/logging';

describe('structured server logging', () => {
    let stdoutOutput: MockInstance<typeof stdout.write>;
    let stderrOutput: MockInstance<typeof stderr.write>;

    beforeEach(() => {
        for (const method of [
            'log',
            'info',
            'debug',
            'warn',
            'error',
            'assert',
            'count',
            'countReset',
            'dir',
            'dirxml',
            'group',
            'groupCollapsed',
            'groupEnd',
            'table',
            'time',
            'timeEnd',
            'timeLog',
            'trace',
        ] as const) {
            vi.spyOn(console, method);
        }
        stdoutOutput = vi.spyOn(stdout, 'write').mockReturnValue(true);
        stderrOutput = vi.spyOn(stderr, 'write').mockReturnValue(true);
        vi.stubEnv('APP_SLOT', 'blue');
        vi.stubEnv('APP_VERSION', '4.2.10');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it.each(['blue', 'green'])('emits one structured line with %s slot and image release context', (slot) => {
        vi.stubEnv('APP_SLOT', slot);
        logEvent('server_started');

        expect(stdout.write).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/\n$/));
        expect(JSON.parse(String(stdoutOutput.mock.calls[0][0]))).toStrictEqual({
            timestamp: expect.any(String),
            level: 'info',
            service: 'rusys-web',
            slot,
            version: '4.2.10',
            event: 'server_started',
        });
        expect(stderr.write).not.toHaveBeenCalled();
    });

    it('omits untrusted strings, errors, nested metadata and credential-like environment values', () => {
        const secret = 'person@example.com Bearer secret cookie=session password=mongodb://user:pass@host';
        vi.stubEnv('APP_SLOT', secret);
        vi.stubEnv('APP_VERSION', secret);
        logEvent(
            'request_failed',
            JSON.parse(
                JSON.stringify({
                    method: secret,
                    routeType: secret,
                    status: secret,
                    password: secret,
                    cookie: secret,
                    error: { message: secret, stack: secret },
                    user: { email: secret },
                })
            ),
            'error'
        );

        expect(JSON.parse(String(stderrOutput.mock.calls[0][0]))).toStrictEqual({
            timestamp: expect.any(String),
            level: 'error',
            service: 'rusys-web',
            slot: 'unknown',
            version: 'unknown',
            event: 'request_failed',
        });
        expect(stdout.write).not.toHaveBeenCalled();
    });

    it.each([99, 600, Number.NaN, 200.5, Number.POSITIVE_INFINITY])('omits invalid status %s', (status) => {
        logEvent('api_handler_failed', { status });

        expect(String(stdoutOutput.mock.calls[0][0])).not.toContain('status');
    });

    it('includes only bounded diagnostic fields and routes warnings to stderr', () => {
        logEvent('request_failed', { method: 'POST', routeType: 'action', status: 500 }, 'warn');

        expect(JSON.parse(String(stderrOutput.mock.calls[0][0]))).toMatchObject({
            method: 'POST',
            routeType: 'action',
            status: 500,
            level: 'warn',
        });
    });

    it('replaces console arguments without reading their values', () => {
        const methods = ['log', 'info', 'debug', 'warn', 'error', 'trace', 'dir', 'table', 'assert'] as const;
        installConsoleLogging();
        const secret = {
            toString: () => {
                throw new Error('must not inspect personal data');
            },
        };
        methods.forEach((method) => console[method](secret));

        const output = [...stdoutOutput.mock.calls, ...stderrOutput.mock.calls].map(([line]) => String(line));

        expect(output).toHaveLength(methods.length);
        expect(output.every((line) => JSON.parse(line).event === 'runtime_output_redacted')).toBe(true);
        expect(output.join('')).not.toContain('personal data');
    });

    it('logs startup only for the Node runtime', async () => {
        vi.stubEnv('NEXT_RUNTIME', 'edge');
        await register();

        expect(stdout.write).not.toHaveBeenCalled();

        vi.stubEnv('NEXT_RUNTIME', 'nodejs');
        await register();

        expect(String(stdoutOutput.mock.calls[0][0])).toContain('server_started');
    });

    it('reports request failures without serializing request or exception data', async () => {
        vi.stubEnv('NEXT_RUNTIME', 'nodejs');
        await onRequestError(
            new Error('sensitive error'),
            {
                path: '/person@example.com?token=secret',
                method: 'GET',
                headers: { cookie: 'secret' },
            },
            { routerKind: 'App Router', routeType: 'route', routePath: '/[...path]', revalidateReason: undefined }
        );

        expect(JSON.parse(String(stderrOutput.mock.calls[0][0]))).toMatchObject({
            event: 'request_failed',
            method: 'GET',
            routeType: 'route',
        });
        expect(String(stderrOutput.mock.calls[0][0])).not.toMatch(/sensitive|example|secret|cookie/);
    });

    it.each(['edge', undefined])('ignores request failures outside Node when NEXT_RUNTIME is %s', async (runtime) => {
        vi.stubEnv('NEXT_RUNTIME', runtime);
        const inspect = vi.fn(() => {
            throw new Error('must not inspect request or exception data');
        });
        const error = new Proxy(new Error('sensitive error'), { get: inspect });
        const request = new Proxy(
            { path: '/person@example.com?token=secret', method: 'GET', headers: { cookie: 'secret' } },
            { get: inspect }
        );
        const context = new Proxy(
            {
                routerKind: 'App Router' as const,
                routeType: 'route' as const,
                routePath: '/[...path]',
                revalidateReason: undefined,
            },
            { get: inspect }
        );

        await expect(onRequestError(error, request, context)).resolves.toBeUndefined();

        expect(inspect).not.toHaveBeenCalled();
        expect(stdout.write).not.toHaveBeenCalled();
        expect(stderr.write).not.toHaveBeenCalled();
    });

    it('keeps the collector allowlist synchronized with emitted records and rejects appended payloads', () => {
        const config = readFileSync('docker/monitoring/config.alloy', 'utf8');
        const expression = config.match(/expression = `([^`]*\?P<safe_app>[^`]*)`/)?.[1];

        expect(expression).toBeDefined();

        const pattern = new RegExp(expression!.replace('?P<', '?<'));
        logEvent('request_failed', { method: 'PATCH', routeType: 'action', status: 500 }, 'error');
        const line = String(stderrOutput.mock.calls[0][0]).trimEnd();

        expect(pattern.test(line)).toBe(true);
        expect(pattern.test(line.replace('request_failed', 'person@example.com'))).toBe(false);
        expect(pattern.test(`${line.slice(0, -1)},"cookie":"secret"}`)).toBe(false);
        expect(pattern.test(`${line}\nsecret`)).toBe(false);
        expect(pattern.test('{"message":"password=secret"}')).toBe(false);
    });
});
