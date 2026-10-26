import { buildAlertRules, buildDashboards, folderUid, type DataSources } from './grafana-config';

interface GrafanaSource {
    uid: string;
    type: string;
    name: string;
}
interface Contact {
    uid: string;
    name: string;
}

export function createClient(address: string, token: string, transport: typeof fetch = fetch) {
    const base = new URL(address);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || !token.trim()) {
        throw new Error(
            'Use an HTTPS Grafana URL without credentials/query/fragment and a nonempty service account token.'
        );
    }
    return async <T>(path: string, method = 'GET', body?: unknown): Promise<T> => {
        if (!path.startsWith('/api/') && !path.startsWith('/apis/notifications.alerting.grafana.app/')) {
            throw new Error('Unexpected Grafana API path.');
        }
        const response = await transport(`${base.href.replace(/\/$/, '')}${path}`, {
            method,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
            redirect: 'error',
            signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) {
            // Never print the response body: contact point settings may contain addresses or secrets.
            throw new Error(`Grafana ${method} ${path} failed (HTTP ${response.status}).`);
        }
        return (response.status === 204 ? undefined : await response.json()) as T;
    };
}

type Client = ReturnType<typeof createClient>;

export async function discover(client: Client, contactName: string, requested: Partial<DataSources> = {}) {
    const sources = await client<GrafanaSource[]>('/api/datasources');
    const contacts = await client<Contact[]>('/api/v1/provisioning/contact-points');
    if (!Array.isArray(sources) || !Array.isArray(contacts)) {
        throw new Error('Unexpected Grafana discovery response.');
    }
    const choose = (type: keyof DataSources): string => {
        const matches = sources.filter(
            (source) => source.type === type && (!requested[type] || source.uid === requested[type])
        );
        if (matches.length !== 1 || !/^[\w-]+$/.test(matches[0].uid)) {
            throw new Error(`Select exactly one ${type} datasource with GRAFANA_${type.toUpperCase()}_UID.`);
        }
        return matches[0].uid;
    };
    if (!contacts.some((contact) => contact.name === contactName)) {
        throw new Error('Configured Grafana contact point was not found.');
    }
    return {
        sources: { prometheus: choose('prometheus'), loki: choose('loki'), tempo: choose('tempo') },
        receiver: contactName,
    };
}

export async function applyMonitoring(client: Client, sources: DataSources, receiver: string): Promise<void> {
    const folders = await client<{ uid: string; title: string }[]>('/api/folders?limit=1000');
    const folder = folders.find((entry) => entry.uid === folderUid);
    if (folder && folder.title !== 'Rusys Monitoring') {
        throw new Error('Monitoring folder UID is already used by another folder.');
    }
    if (!folder) {
        await client('/api/folders', 'POST', { uid: folderUid, title: 'Rusys Monitoring' });
    }
    // The dedicated dashboard/rule UIDs are owned by this bundle. Existing global notification policies are untouched.
    for (const dashboard of buildDashboards(sources)) {
        await client('/api/dashboards/db', 'POST', {
            dashboard,
            folderUid,
            overwrite: true,
            message: 'Provision Rusys monitoring dashboard',
        });
    }
    const existing = await client<{ uid: string; folderUID: string; ruleGroup: string }[]>(
        '/api/v1/provisioning/alert-rules'
    );
    for (const rule of buildAlertRules(sources, receiver)) {
        const previous = existing.find((entry) => entry.uid === rule.uid);
        if (previous && (previous.folderUID !== folderUid || previous.ruleGroup !== rule.ruleGroup)) {
            throw new Error('Monitoring alert UID is already used outside the managed group.');
        }
        await client(
            previous ? `/api/v1/provisioning/alert-rules/${rule.uid}` : '/api/v1/provisioning/alert-rules',
            previous ? 'PUT' : 'POST',
            rule
        );
    }
}

export async function verifyMonitoring(client: Client, sources: DataSources, receiver: string): Promise<void> {
    for (const dashboard of buildDashboards(sources)) {
        const stored = await client<{ dashboard: { title: string }; meta: { folderUid: string } }>(
            `/api/dashboards/uid/${dashboard.uid}`
        );
        if (stored.dashboard.title !== dashboard.title || stored.meta.folderUid !== folderUid) {
            throw new Error(`Dashboard verification failed for ${dashboard.uid}.`);
        }
    }
    for (const rule of buildAlertRules(sources, receiver)) {
        const stored = await client<{ notification_settings?: { receiver?: string }; condition: string }>(
            `/api/v1/provisioning/alert-rules/${rule.uid}`
        );
        if (stored.condition !== rule.condition || stored.notification_settings?.receiver !== receiver) {
            throw new Error(`Alert verification failed for ${rule.uid}.`);
        }
    }
}

export async function testContactPoint(client: Client, receiver: string): Promise<number> {
    const settings = await client<{ namespace?: string }>('/api/frontend/settings');
    if (!settings.namespace || !/^[\w-]+$/.test(settings.namespace)) {
        throw new Error('Cannot discover the Grafana notification namespace.');
    }
    const prefix = `/apis/notifications.alerting.grafana.app/v1beta1/namespaces/${settings.namespace}/receivers`;
    const receivers = await client<{
        items: {
            metadata: { name: string };
            spec: {
                title: string;
                integrations: { uid: string; type: string; version: string; settings: Record<string, unknown> }[];
            };
        }[];
    }>(prefix);
    const target = receivers.items.filter((entry) => entry.spec.title === receiver);
    if (target.length !== 1 || !target[0].spec.integrations.length) {
        throw new Error('Contact point has no uniquely identified receiver/integration.');
    }
    for (const integration of target[0].spec.integrations) {
        const result = await client<{ status: string }>(
            `${prefix}/${encodeURIComponent(target[0].metadata.name)}/test`,
            'POST',
            {
                integration,
                alert: {
                    labels: {
                        alertname: 'Rusys monitoring notification test',
                        project: 'rusys',
                        environment: 'production',
                    },
                    annotations: {
                        summary: 'Rusys monitoring test notification',
                        description: 'Controlled contact point delivery test. No production outage is being simulated.',
                    },
                },
            }
        );
        if (result.status !== 'success') {
            throw new Error('Grafana contact point test reported a delivery failure.');
        }
    }
    return target[0].spec.integrations.length;
}
