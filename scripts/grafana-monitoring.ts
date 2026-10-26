import { mkdirSync, writeFileSync } from 'node:fs';

import { applyMonitoring, createClient, discover, testContactPoint, verifyMonitoring } from './grafana-api';
import { buildAlertRules, buildDashboards, dashboardNames, defaults } from './grafana-config';

async function main(): Promise<void> {
    const task = process.argv[2] ?? 'plan';
    if (!['render', 'plan', 'apply', 'verify', 'test-contact'].includes(task)) {
        throw new Error('Usage: grafana-monitoring.ts [render|plan|apply|verify|test-contact]');
    }
    if (task === 'render') {
        mkdirSync('docker/monitoring/dashboards', { recursive: true });
        buildDashboards().forEach((dashboard, index) => {
            writeFileSync(
                `docker/monitoring/dashboards/${dashboardNames[index]}.json`,
                `${JSON.stringify(dashboard, null, 2)}\n`
            );
        });
        writeFileSync(
            'docker/monitoring/baseline-alerts.json',
            `${JSON.stringify(buildAlertRules(defaults, 'Rusys uptime email'), null, 2)}\n`
        );
        console.log(
            'Rendered four dashboards and the baseline alert definitions. Format generated files with Prettier.'
        );
        return;
    }
    const client = createClient(process.env.GRAFANA_URL ?? '', process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN ?? '');
    const { sources, receiver } = await discover(client, process.env.GRAFANA_CONTACT_POINT ?? 'Rusys uptime email', {
        prometheus: process.env.GRAFANA_PROMETHEUS_UID,
        loki: process.env.GRAFANA_LOKI_UID,
        tempo: process.env.GRAFANA_TEMPO_UID,
    });
    if (task === 'apply') {
        await applyMonitoring(client, sources, receiver);
    }
    if (task === 'verify' || task === 'apply') {
        await verifyMonitoring(client, sources, receiver);
    }
    if (task === 'test-contact') {
        const count = await testContactPoint(client, receiver);
        console.log(
            `Grafana reports successful test delivery to ${count} contact point integration(s). Confirm arrival at the destination independently.`
        );
        return;
    }
    console.log(
        `${task}: four dashboards and ${buildAlertRules(sources, receiver).length} baseline rules; data sources and existing contact point resolved. Notification delivery requires a separate end-to-end test.`
    );
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Grafana monitoring failed.');
    process.exitCode = 1;
});
