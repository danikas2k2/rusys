import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { applyMonitoring, createClient, discover, testContactPoint } from './grafana-api';
import {
    alertSpecs,
    apiCount,
    apiErrors,
    buildAlertRules,
    buildDashboards,
    dashboardNames,
    defaults,
    folderUid,
} from './grafana-config';

const sources = { prometheus: 'test-prom', loki: 'test-logs', tempo: 'test-traces' };
const contact = 'Rusys uptime email';
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('monitoring dashboards and alert contracts', () => {
    it('renders four linked dashboards and keeps the checked-in artifacts reproducible', () => {
        const dashboards = buildDashboards();

        expect(dashboards.map((dashboard) => dashboard.title)).toStrictEqual([
            'Rusys Overview',
            'Infrastructure',
            'Application',
            'Frontend & Usage',
        ]);

        dashboards.forEach((dashboard, index) => {
            expect(
                JSON.parse(readFileSync(`docker/monitoring/dashboards/${dashboardNames[index]}.json`, 'utf8'))
            ).toStrictEqual(dashboard);
        });
    });

    it('resolves data source references while retaining the bounded frontend app selector', () => {
        const dashboards = buildDashboards(sources);
        const serialized = JSON.stringify(dashboards);

        expect(serialized).not.toContain(defaults.prometheus);
        expect(serialized).not.toContain(defaults.loki);
        expect(serialized).not.toContain(defaults.tempo);
        expect(serialized).toContain('value_lcp');
        expect(serialized).toContain('value_inp');
        expect(serialized).toContain('value_cls');
        expect(serialized).toContain('8029');
    });

    it('excludes health probes from real API volume and provides zero errors only when requests exist', () => {
        expect(apiCount).toContain('uri != "/api/health"');
        expect(apiCount).toContain('uri =~ "^/api/.*"');
        expect(apiErrors).toContain(`or (${apiCount} * 0)`);

        const rules = alertSpecs.filter((rule) => rule.uid === 'rusys-api-errors' || rule.uid === 'rusys-api-latency');

        expect(rules).toHaveLength(2);

        rules.forEach((rule) => {
            expect(rule.expr).toContain(`${apiCount} >= 20`);
            expect(rule.pending).toMatch(/5m|10m/);
        });
    });

    it('does not let a healthy left-hand series mask MongoDB or backup failure branches', () => {
        const mongo = alertSpecs.find((rule) => rule.uid === 'rusys-mongodb-down');
        const backup = alertSpecs.find((rule) => rule.uid === 'rusys-backup-status');

        expect(mongo?.expr).not.toContain('bool');
        expect(backup?.expr).not.toContain('bool');
        expect(mongo?.expr).toContain('absent(mongodb_up');
        expect(backup?.expr).toContain('absent(rusys_backup_last_success_timestamp_seconds');
        expect(backup?.expr).toContain('absent(rusys_backup_last_run_success');
        expect(backup?.expr).toContain('7200');
    });

    it('bounds infrastructure alerts to finite container limits and real NAS volumes', () => {
        const memory = alertSpecs.find((rule) => rule.uid === 'rusys-container-memory');
        const disk = alertSpecs.find((rule) => rule.uid === 'rusys-disk-space');

        expect(memory?.expr).toContain('name=~"rusys-.*"');
        expect(memory?.expr).toContain('> 0');
        expect(memory?.expr).toContain('< 1e15');
        expect(disk?.expr).toContain('mountpoint=~"/|/volume[0-9]+"');
        expect(disk?.expr).toContain('> bool 0.80');
    });

    it('covers missing checks independently and gates failure windows on three samples', () => {
        const down = alertSpecs.find((rule) => rule.uid === 'rusys-public-down');
        const missing = alertSpecs.find((rule) => rule.uid === 'rusys-public-missing');

        expect(down?.expr).toContain('[15m]');
        expect(down?.expr).toContain('>= 3');
        expect(missing?.expr).toContain('job="rusys-homepage"');
        expect(missing?.expr).toContain('job="rusys-health"');
        expect(missing?.expr).toContain('absent_over_time');
        expect(down?.expr).toContain('environment="production"');
        expect(missing?.expr).toContain('environment="production"');
    });

    it('queries the current running slot at the current instant instead of retaining stopped slots from history', () => {
        const currentSlot = buildDashboards()[0].panels.find(
            (item) => item.title === 'Currently observed running application slot'
        );
        const target = (currentSlot?.targets as { instant: boolean; range: boolean; queryType: string }[])[0];

        expect(target.instant).toBe(true);
        expect(target.range).toBe(false);
        expect(target.queryType).toBe('instant');
    });

    it('labels failure categories and probe locations with text instead of relying on color', () => {
        const dashboards = buildDashboards();
        const failures = dashboards[2].panels.find((item) => item.title === 'Application failure events');
        const probes = dashboards[0].panels.find((item) => item.title === 'Public availability by check / probe');

        expect((failures?.targets as { legendFormat: string }[])[0].legendFormat).toBe('{{slot}} · {{event}}');
        expect((probes?.targets as { legendFormat: string }[])[0].legendFormat).toBe('{{job}} · {{probe}}');
    });

    it('uses the existing contact point directly and documents actionable conditions', () => {
        const rules = buildAlertRules(sources, contact);

        expect(rules).toHaveLength(10);
        expect(
            rules.every((rule) => rule.notification_settings.receiver === contact && rule.folderUID === folderUid)
        ).toBe(true);
        expect(
            rules.every((rule) => rule.annotations.description.length > 30 && rule.annotations.summary.length > 30)
        ).toBe(true);
        expect(() => buildAlertRules(sources, ' ')).toThrow('contact point');
        expect(JSON.parse(readFileSync('docker/monitoring/baseline-alerts.json', 'utf8'))).toStrictEqual(
            buildAlertRules(defaults, contact)
        );
    });

    it('does not turn healthy empty absence expressions or insufficient probe samples into no-data alerts', () => {
        const rules = buildAlertRules(sources, contact);
        const explicitAbsence = [
            'rusys-public-down',
            'rusys-public-missing',
            'rusys-gateway-missing',
            'rusys-mongodb-down',
            'rusys-backup-status',
        ];

        expect(
            rules.filter((rule) => explicitAbsence.includes(rule.uid)).map((rule) => rule.noDataState)
        ).toStrictEqual(['OK', 'OK', 'OK', 'OK', 'OK']);
        expect(
            rules
                .filter((rule) => rule.uid === 'rusys-nas-memory' || rule.uid === 'rusys-disk-space')
                .every((rule) => rule.noDataState === 'Alerting')
        ).toBe(true);
    });

    it('links each alert to both a dashboard and an existing panel as required by Grafana provisioning', () => {
        const dashboards = buildDashboards();
        const rules = buildAlertRules(sources, contact);

        rules.forEach((rule) => {
            const dashboard = dashboards.find((entry) => entry.uid === rule.annotations.__dashboardUid__);

            expect(dashboard?.panels.some((item) => String(item.id) === rule.annotations.__panelId__)).toBe(true);
        });
    });
});

describe('grafana administration boundaries', () => {
    it('rejects credentials in URLs, non-HTTPS endpoints, and empty tokens', () => {
        expect(() => createClient('http://grafana.example', 'token')).toThrow('HTTPS');
        expect(() => createClient('https://user:password@grafana.example', 'token')).toThrow('HTTPS');
        expect(() => createClient('https://grafana.example?token=secret', 'token')).toThrow('HTTPS');
        expect(() => createClient('https://grafana.example', '')).toThrow('nonempty');
    });

    it('does not expose error response bodies and refuses authenticated redirects', async () => {
        const transport = vi.fn<typeof fetch>().mockResolvedValue(response({ secret: 'do-not-log' }, 403));
        const client = createClient('https://grafana.example', 'token', transport);

        await expect(client('/api/datasources')).rejects.toThrow('HTTP 403');
        expect(transport).toHaveBeenCalledWith(
            'https://grafana.example/api/datasources',
            expect.objectContaining({ redirect: 'error' })
        );
        await expect(client('https://evil.example')).rejects.toThrow('Unexpected');
    });

    it('refuses ambiguous data sources and missing contact points', async () => {
        const transport = vi.fn<typeof fetch>().mockImplementation(async (url) =>
            response(
                String(url).endsWith('datasources')
                    ? [
                          { uid: 'p1', type: 'prometheus' },
                          { uid: 'p2', type: 'prometheus' },
                      ]
                    : [{ name: contact }]
            )
        );
        const client = createClient('https://grafana.example', 'token', transport);

        await expect(discover(client, contact)).rejects.toThrow('exactly one prometheus');
        await expect(discover(client, 'missing')).rejects.toThrow('contact point');
    });

    it('provisions only dedicated dashboards and rules without replacing notification policies', async () => {
        const transport = vi.fn<typeof fetch>().mockImplementation(async (url, options) => {
            if (options?.method === 'GET') {
                return response(
                    String(url).includes('/folders?') ? [{ uid: folderUid, title: 'Rusys Monitoring' }] : []
                );
            }
            return response({});
        });
        const client = createClient('https://grafana.example', 'token', transport);
        await applyMonitoring(client, sources, contact);
        const writes = transport.mock.calls.filter(([, options]) => options?.method === 'POST');

        expect(writes.filter(([url]) => String(url).endsWith('/api/dashboards/db'))).toHaveLength(4);
        expect(writes.filter(([url]) => String(url).endsWith('/alert-rules'))).toHaveLength(10);
        expect(transport.mock.calls.some(([url]) => String(url).includes('/policies'))).toBe(false);
        expect(writes.every(([, options]) => !String(options?.body).includes('secureSettings'))).toBe(true);
    });

    it('uses receiver resource names and fails an HTTP-successful test that reports delivery failure', async () => {
        const transport = vi.fn<typeof fetch>().mockImplementation(async (url) => {
            if (String(url).endsWith('/api/frontend/settings')) {
                return response({ namespace: 'stacks-test' });
            }
            if (String(url).endsWith('/receivers')) {
                return response({
                    items: [
                        {
                            metadata: { name: 'resource-name' },
                            spec: {
                                title: contact,
                                integrations: [
                                    {
                                        uid: 'integration-uid',
                                        type: 'email',
                                        version: 'v1',
                                        settings: { addresses: 'fixture@example.com' },
                                    },
                                ],
                            },
                        },
                    ],
                });
            }
            return response({ status: 'failure', error: 'do-not-print-credentials' });
        });
        const client = createClient('https://grafana.example', 'token', transport);

        await expect(testContactPoint(client, contact)).rejects.toThrow('delivery failure');
        expect(transport).toHaveBeenLastCalledWith(
            expect.stringContaining('/receivers/resource-name/test'),
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('reports successful provider delivery only after every integration succeeds', async () => {
        const transport = vi.fn<typeof fetch>().mockImplementation(async (url) => {
            if (String(url).endsWith('/api/frontend/settings')) {
                return response({ namespace: 'stacks-test' });
            }
            if (String(url).endsWith('/receivers')) {
                return response({
                    items: [
                        {
                            metadata: { name: 'resource-name' },
                            spec: { title: contact, integrations: [{ type: 'email', version: 'v1', settings: {} }] },
                        },
                    ],
                });
            }
            return response({ status: 'success' });
        });

        await expect(
            testContactPoint(createClient('https://grafana.example', 'token', transport), contact)
        ).resolves.toBe(1);
    });
});
