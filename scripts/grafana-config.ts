import { readFileSync } from 'node:fs';

export interface DataSources {
    prometheus: string;
    loki: string;
    tempo: string;
}

export const folderUid = 'rusys-monitoring';
export const ruleGroup = 'rusys-baseline';
export const dashboardNames = ['overview', 'infrastructure', 'application', 'frontend-usage'] as const;
export const defaults: DataSources = {
    prometheus: '$' + '{prometheus}',
    loki: '$' + '{loki}',
    tempo: '$' + '{tempo}',
};

const scope = 'project="rusys",environment="production"';
const host = `${scope},host="synology-ds923"`;
const gateway = `{${scope},container="rusys-gateway"} | json | uri != "" | __error__=""`;
const api = `${gateway} | uri =~ "^/api/.*" | uri != "/api/health"`;
export const apiCount = `sum(count_over_time(${api} [5m]))`;
export const apiErrors = `(sum(count_over_time(${api} | status >= 500 [5m])) or (${apiCount} * 0))`;
export const apiP95 = `quantile_over_time(0.95, ${api} | unwrap request_time | __error__="" [5m]) by (container)`;
const memoryRatio = `container_memory_working_set_bytes{${host},name=~"rusys-.*"} / container_spec_memory_limit_bytes{${host},name=~"rusys-.*"}`;
const finiteMemory = `container_spec_memory_limit_bytes{${host},name=~"rusys-.*"} > 0 and container_spec_memory_limit_bytes{${host},name=~"rusys-.*"} < 1e15`;
const disk = `${host},fstype!~"tmpfs|devtmpfs|overlay|squashfs|nsfs",mountpoint=~"/|/volume[0-9]+"`;
export const diskUsed = `1 - node_filesystem_avail_bytes{${disk}} / node_filesystem_size_bytes{${disk}}`;
const mongo = `${scope},job="integrations/mongodb",instance="rusys-db"`;
const probe = 'project="rusys",environment="production",job=~"rusys-homepage|rusys-health"';
const backup = `${scope},host="synology-ds923"`;

type Source = keyof DataSources;
type Panel = Record<string, unknown>;
const legends: Record<string, string> = {
    'Public availability by check / probe': '{{job}} · {{probe}}',
    'Uptime over 24 hours': '{{job}}',
    'Uptime over 7 days': '{{job}}',
    'NAS CPU by mode': '{{mode}}',
    'Filesystem used fraction': '{{mountpoint}} · {{device}}',
    'NAS disk read/write bytes per second': '{{device}}',
    'Collector scrape availability': '{{job}} · {{instance}}',
    'NGINX requests by status': '{{status}}',
    'Application failure events': '{{slot}} · {{event}}',
    'MongoDB connections': '{{conn_type}}',
    'MongoDB operations per second': '{{legacy_op_type}}',
};

function panel(
    id: number,
    title: string,
    source: Source,
    expr: string,
    unit = 'short',
    type = 'timeseries',
    instant = false
): Panel {
    return {
        id,
        title,
        type,
        description:
            'Production Rusys telemetry. No data means missing telemetry or no eligible activity; verify collection before interpreting it as healthy.',
        datasource: { type: source, uid: defaults[source] },
        gridPos: { x: ((id - 2) % 2) * 12, y: 4 + Math.floor((id - 2) / 2) * 8, w: 12, h: 8 },
        fieldConfig: { defaults: { unit, noValue: 'No data — check collection' }, overrides: [] },
        options:
            type === 'stat'
                ? {
                      colorMode: 'value',
                      graphMode: 'none',
                      reduceOptions: { calcs: ['lastNotNull'], fields: '', values: false },
                  }
                : {
                      tooltip: { mode: 'multi' },
                      legend: { displayMode: 'table', placement: 'bottom', calcs: ['lastNotNull', 'max'] },
                  },
        targets: [
            {
                refId: 'A',
                datasource: { type: source, uid: defaults[source] },
                expr,
                query: source === 'tempo' ? expr : undefined,
                tableType: source === 'tempo' ? 'traces' : undefined,
                filters: source === 'tempo' ? [] : undefined,
                queryType: source === 'tempo' ? 'traceql' : instant ? 'instant' : 'range',
                instant: source === 'prometheus' ? instant : undefined,
                range: source === 'prometheus' ? !instant : undefined,
                editorMode: 'code',
                legendFormat: legends[title] ?? (expr.includes('name=') ? '{{name}}' : title),
            },
        ],
    };
}

function note(content: string): Panel {
    return {
        id: 1,
        title: 'Coverage and interpretation',
        type: 'text',
        gridPos: { x: 0, y: 0, w: 24, h: 4 },
        options: { mode: 'markdown', content },
    };
}

function dashboard(uid: string, title: string, panels: Panel[]) {
    return {
        uid,
        title,
        id: null,
        schemaVersion: 39,
        version: 1,
        editable: true,
        tags: ['rusys', 'production', 'monitoring'],
        timezone: 'browser',
        refresh: '1m',
        time: { from: 'now-24h', to: 'now' },
        annotations: { list: [] },
        links: dashboardNames.map((name, i) => ({
            title: ['Rusys Overview', 'Infrastructure', 'Application', 'Frontend & Usage'][i],
            type: 'link',
            url: `/d/rusys-${name}`,
            keepTime: true,
            includeVars: true,
        })),
        templating: {
            list: Object.entries(defaults).map(([name]) => ({
                name,
                label: `${name} data source`,
                type: 'datasource',
                query: name,
                current: {},
                refresh: 1,
            })),
        },
        panels,
    };
}

export function buildDashboards(sources: DataSources = defaults) {
    const overview = dashboard('rusys-overview', 'Rusys Overview', [
        note(
            'Start with public checks, then follow the links to isolate infrastructure, application, or browser symptoms. Uptime is sampled probe success, not a contractual SLA. A startup log identifies the latest observed release for a slot; it does not prove that NGINX currently routes traffic to it. Missing backup/slot telemetry is an explicit coverage gap.'
        ),
        panel(2, 'Public availability by check / probe', 'prometheus', `probe_success{${probe}}`, 'bool'),
        panel(
            3,
            'Uptime over 24 hours',
            'prometheus',
            `100 * avg by (job) (avg_over_time(probe_success{${probe}}[24h]))`,
            'percent',
            'stat'
        ),
        panel(
            4,
            'Uptime over 7 days',
            'prometheus',
            `100 * avg by (job) (avg_over_time(probe_success{${probe}}[7d]))`,
            'percent',
            'stat'
        ),
        panel(
            5,
            'NAS CPU use',
            'prometheus',
            `1 - avg(rate(node_cpu_seconds_total{${host},mode="idle"}[5m]))`,
            'percentunit'
        ),
        panel(
            6,
            'NAS memory use',
            'prometheus',
            `1 - node_memory_MemAvailable_bytes{${host}} / node_memory_MemTotal_bytes{${host}}`,
            'percentunit'
        ),
        panel(7, 'API 5xx fraction', 'loki', `${apiErrors} / ${apiCount}`, 'percentunit'),
        panel(8, 'API p95 duration', 'loki', apiP95, 's'),
        panel(
            9,
            'Latest observed application startup / slot / release',
            'loki',
            `{${scope},service_name="rusys-web"} | json | event="server_started" | __error__=""`,
            'short',
            'logs'
        ),
        panel(
            12,
            'Currently observed running application slot',
            'prometheus',
            `(max by (name) (container_last_seen{${host},name=~"rusys-app-(blue|green)"}) > time() - 60) * 0 + 1`,
            'bool',
            'stat',
            true
        ),
        panel(10, 'MongoDB connection health', 'prometheus', `mongodb_up{${mongo}}`, 'bool'),
        panel(
            11,
            'Last successful backup age',
            'prometheus',
            `time() - rusys_backup_last_success_timestamp_seconds{${backup}}`,
            's'
        ),
    ]);
    const infrastructure = dashboard('rusys-infrastructure', 'Infrastructure', [
        note(
            'Host metrics are scoped to the Synology deployment. Container memory percentages are shown only for finite, configured limits; unlimited containers still show working-set bytes. cAdvisor start time changes indicate recreation/restart, not a durable restart counter. Filesystem panels may be unavailable on DSM: no data is not free disk space.'
        ),
        panel(2, 'NAS CPU by mode', 'prometheus', `sum by (mode) (rate(node_cpu_seconds_total{${host}}[5m]))`, 'short'),
        panel(3, 'NAS available memory', 'prometheus', `node_memory_MemAvailable_bytes{${host}}`, 'bytes'),
        panel(
            4,
            'Container CPU cores',
            'prometheus',
            `sum by (name) (rate(container_cpu_usage_seconds_total{${host},name=~"rusys-.*"}[5m]))`
        ),
        panel(
            5,
            'Container working set (current and peak in legend)',
            'prometheus',
            `container_memory_working_set_bytes{${host},name=~"rusys-.*"}`,
            'bytes'
        ),
        panel(
            6,
            'Container memory / configured limit',
            'prometheus',
            `(${memoryRatio}) and (${finiteMemory})`,
            'percentunit'
        ),
        panel(7, 'Filesystem used fraction', 'prometheus', diskUsed, 'percentunit'),
        panel(
            8,
            'NAS disk read/write bytes per second',
            'prometheus',
            `sum by (device) (rate(node_disk_read_bytes_total{${host}}[5m]) + rate(node_disk_written_bytes_total{${host}}[5m]))`,
            'Bps'
        ),
        panel(
            9,
            'Container network receive / transmit bytes per second',
            'prometheus',
            `sum by (name) (rate(container_network_receive_bytes_total{${host},name=~"rusys-.*"}[5m]) + rate(container_network_transmit_bytes_total{${host},name=~"rusys-.*"}[5m]))`,
            'Bps'
        ),
        panel(
            10,
            'Observed container start-time changes over 24h',
            'prometheus',
            `changes((max by (name, host) (container_start_time_seconds{${host},name=~"rusys-.*"}))[24h:1m])`
        ),
        panel(11, 'Collector scrape availability', 'prometheus', `up{${host}}`, 'bool'),
    ]);
    const application = dashboard('rusys-application', 'Application', [
        note(
            'Gateway latency uses numeric request_time, including upstream and proxy time. API excludes /api/health so external probes cannot mask errors or satisfy the traffic guard. Trace data is sampled; use gateway logs for request volume. Parsed request fields are aggregated away from numeric series.'
        ),
        panel(2, 'NGINX requests per second', 'loki', `sum(rate(${gateway} [5m]))`, 'reqps'),
        panel(3, 'NGINX requests by status', 'loki', `sum by (status) (count_over_time(${gateway} [5m]))`),
        panel(
            4,
            'NGINX p95 duration',
            'loki',
            `quantile_over_time(0.95, ${gateway} | unwrap request_time | __error__="" [5m]) by (container)`,
            's'
        ),
        panel(5, 'API requests per 5 minutes (alert requires at least 20)', 'loki', apiCount),
        panel(6, 'API 5xx fraction', 'loki', `${apiErrors} / ${apiCount}`, 'percentunit'),
        panel(7, 'API p95 duration', 'loki', apiP95, 's'),
        panel(
            8,
            'Application failure events',
            'loki',
            `sum by (slot, event) (count_over_time({${scope},service_name="rusys-web"} | json | event =~ "api_handler_failed|request_failed" | __error__="" [5m]))`
        ),
        panel(
            9,
            'MongoDB connections',
            'prometheus',
            `mongodb_ss_connections{${mongo},conn_type=~"current|available|active"}`
        ),
        panel(
            10,
            'MongoDB operations per second',
            'prometheus',
            `sum by (legacy_op_type) (rate(mongodb_ss_opcounters{${mongo}}[5m]))`,
            'ops'
        ),
        panel(11, 'MongoDB database connection health', 'prometheus', `mongodb_up{${mongo}}`, 'bool'),
        panel(
            12,
            'Recent backend traces (open a trace for nested operations)',
            'tempo',
            '{ resource.service.name = "rusys-web" }',
            'short',
            'table'
        ),
        panel(
            13,
            'Slow backend traces',
            'tempo',
            '{ resource.service.name = "rusys-web" && duration > 1s }',
            'short',
            'table'
        ),
    ]);
    const usage = JSON.parse(readFileSync('docker/monitoring/frontend-usage-dashboard.json', 'utf8')) as ReturnType<
        typeof dashboard
    >;
    const frontend = dashboard('rusys-frontend-usage', 'Frontend & Usage', usage.panels);
    // Keep the existing bounded usage queries and app selector; add browser diagnostics.
    frontend.templating = usage.templating;
    frontend.panels = [
        ...usage.panels,
        {
            ...panel(
                18,
                'Browser exceptions',
                'loki',
                'sum(count_over_time({app_id="$app_id",kind="exception"} [5m]))'
            ),
            gridPos: { x: 0, y: 56, w: 12, h: 8 },
        },
        {
            ...panel(
                19,
                'LCP p75',
                'loki',
                'quantile_over_time(0.75, {app_id="$app_id",kind="measurement"} | logfmt | type="web-vitals" | unwrap value_lcp | __error__="" [5m]) by (app_id)',
                'ms'
            ),
            gridPos: { x: 12, y: 56, w: 12, h: 8 },
        },
        {
            ...panel(
                21,
                'INP p75',
                'loki',
                'quantile_over_time(0.75, {app_id="$app_id",kind="measurement"} | logfmt | type="web-vitals" | unwrap value_inp | __error__="" [5m]) by (app_id)',
                'ms'
            ),
            gridPos: { x: 0, y: 64, w: 12, h: 8 },
        },
        {
            ...panel(
                22,
                'CLS p75',
                'loki',
                'quantile_over_time(0.75, {app_id="$app_id",kind="measurement"} | logfmt | type="web-vitals" | unwrap value_cls | __error__="" [5m]) by (app_id)'
            ),
            gridPos: { x: 12, y: 64, w: 12, h: 8 },
        },
        {
            id: 20,
            title: 'Session coverage',
            type: 'text',
            gridPos: { x: 0, y: 72, w: 24, h: 4 },
            options: {
                mode: 'markdown',
                content:
                    'The browser SDK sends a random memory-only session ID required by Faro. Session instrumentation/history is intentionally disabled. Usage events are not unique visitors or persistent sessions; use Frontend Observability for available session diagnostics. Browser panels may be empty before an eligible browser sends telemetry.',
            },
        },
    ];
    const dashboards = [overview, infrastructure, application, frontend];
    return JSON.parse(
        JSON.stringify(dashboards)
            .replaceAll(defaults.prometheus, sources.prometheus)
            .replaceAll(defaults.loki, sources.loki)
            .replaceAll(defaults.tempo, sources.tempo)
    ) as typeof dashboards;
}

export interface AlertSpec {
    uid: string;
    title: string;
    source: 'prometheus' | 'loki';
    expr: string;
    pending: string;
    summary: string;
    action: string;
    dashboard: string;
    panelId: number;
    noData?: 'Alerting' | 'OK';
}

export const alertSpecs: AlertSpec[] = [
    {
        uid: 'rusys-public-down',
        title: 'Rusys public endpoint unavailable',
        source: 'prometheus',
        expr: `(max by (job) (max_over_time(probe_success{${probe}}[15m])) == bool 0) and (min by (job) (count_over_time(probe_success{${probe}}[15m])) >= 3)`,
        pending: '0s',
        summary: 'All probes failed throughout the last 15 minutes with at least three executions per probe.',
        action: 'Check public DNS/TLS, NAS connectivity, gateway, and active slot. Check both homepage and health checks in Synthetic Monitoring.',
        dashboard: 'overview',
        panelId: 2,
        noData: 'OK',
    },
    {
        uid: 'rusys-public-missing',
        title: 'Rusys public check telemetry missing',
        source: 'prometheus',
        expr: 'absent_over_time(probe_success{project="rusys",environment="production",job="rusys-homepage"}[20m]) or absent_over_time(probe_success{project="rusys",environment="production",job="rusys-health"}[20m])',
        pending: '0s',
        summary: 'At least one required external check has no samples for 20 minutes.',
        action: 'Check Synthetic Monitoring check definitions, probe health and metric ingestion. Missing probe data is not proof of public uptime.',
        dashboard: 'overview',
        panelId: 2,
        noData: 'OK',
    },
    {
        uid: 'rusys-nas-memory',
        title: 'Rusys NAS memory pressure',
        source: 'prometheus',
        expr: `node_memory_MemAvailable_bytes{${host}} / node_memory_MemTotal_bytes{${host}} < bool 0.15`,
        pending: '10m',
        summary: 'NAS available memory below 15% for 10 minutes.',
        action: 'Inspect container working sets, NAS services and swap; identify sustained growth before restarting anything.',
        dashboard: 'infrastructure',
        panelId: 3,
        noData: 'Alerting',
    },
    {
        uid: 'rusys-container-memory',
        title: 'Rusys container memory pressure',
        source: 'prometheus',
        expr: `((${memoryRatio}) > bool 0.85) and (${finiteMemory})`,
        pending: '5m',
        summary: 'Container working set exceeds 85% of a finite configured memory limit for 5 minutes.',
        action: 'Inspect the named container, its configured limit, release and workload. Unlimited containers are excluded.',
        dashboard: 'infrastructure',
        panelId: 6,
    },
    {
        uid: 'rusys-disk-space',
        title: 'Rusys filesystem capacity',
        source: 'prometheus',
        expr: `(${diskUsed}) > bool 0.80`,
        pending: '15m',
        summary: 'Persistent filesystem usage above 80% for 15 minutes.',
        action: 'Confirm the affected device/mount; inspect Docker storage, logs and backups. Do not delete database files.',
        dashboard: 'infrastructure',
        panelId: 7,
        noData: 'Alerting',
    },
    {
        uid: 'rusys-gateway-missing',
        title: 'Rusys gateway telemetry missing',
        source: 'loki',
        expr: `absent_over_time({${scope},container="rusys-gateway"} [20m])`,
        pending: '0s',
        summary: 'No gateway log samples for 20 minutes, including scheduled external probes.',
        action: 'Check gateway access logging, Alloy Docker discovery and Loki ingestion. This covers missing API metrics without alerting on ordinary low traffic.',
        dashboard: 'application',
        panelId: 2,
        noData: 'OK',
    },
    {
        uid: 'rusys-api-errors',
        title: 'Rusys API 5xx errors',
        source: 'loki',
        expr: `((${apiErrors} / ${apiCount}) > bool 0.02) and (${apiCount} >= 20)`,
        pending: '5m',
        summary:
            'API 5xx ratio exceeds 2% with at least 20 non-health API requests per 5-minute window, sustained for 5 minutes.',
        action: 'Inspect gateway status, application failures and traces; correlate with release/slot. Low traffic does not trigger this rate alert.',
        dashboard: 'application',
        panelId: 6,
    },
    {
        uid: 'rusys-api-latency',
        title: 'Rusys API p95 latency',
        source: 'loki',
        expr: `(${apiP95} > bool 1) and on() (${apiCount} >= 20)`,
        pending: '10m',
        summary:
            'API p95 exceeds 1 second with at least 20 non-health API requests per 5-minute window for 10 minutes.',
        action: 'Open slow backend traces; inspect MongoDB, image work, CPU and memory before adjusting the threshold.',
        dashboard: 'application',
        panelId: 7,
    },
    {
        uid: 'rusys-mongodb-down',
        title: 'Rusys MongoDB monitoring unavailable',
        source: 'prometheus',
        expr: `((up{${mongo}} == 0) + 1) or ((mongodb_up{${mongo}} == 0) + 1) or absent(up{${mongo}}) or absent(mongodb_up{${mongo}})`,
        pending: '5m',
        summary: 'MongoDB exporter scrape or database connection unavailable/missing for 5 minutes.',
        action: 'Check Alloy discovery, exporter credentials/clusterMonitor role and private MongoDB connectivity. Do not expose database ports.',
        dashboard: 'application',
        panelId: 11,
        noData: 'OK',
    },
    {
        uid: 'rusys-backup-status',
        title: 'Rusys backup stale failed or missing',
        source: 'prometheus',
        expr: `((time() - rusys_backup_last_success_timestamp_seconds{${backup}} > 7200) * 0 + 1) or ((rusys_backup_last_run_success{${backup}} == 0) + 1) or absent(rusys_backup_last_success_timestamp_seconds{${backup}}) or absent(rusys_backup_last_run_success{${backup}})`,
        pending: '15m',
        summary: 'Backup failed, last success older than 2 hours, or backup telemetry missing for 15 minutes.',
        action: 'Inspect the backup scheduler, latest exit status and storage destination; never assume a backup succeeded.',
        dashboard: 'overview',
        panelId: 11,
        noData: 'OK',
    },
];

export function buildAlertRules(sources: DataSources, receiver: string) {
    if (!receiver.trim()) {
        throw new Error('A configured contact point name is required.');
    }
    return alertSpecs.map((spec) => ({
        uid: spec.uid,
        title: spec.title,
        ruleGroup,
        folderUID: folderUid,
        condition: 'B',
        for: spec.pending,
        noDataState: spec.noData ?? 'OK',
        execErrState: 'Error',
        labels: {
            project: 'rusys',
            environment: 'production',
            severity: spec.uid === 'rusys-public-down' ? 'critical' : 'warning',
        },
        annotations: {
            summary: spec.summary,
            description: spec.action,
            runbook_url: 'https://github.com/danikas2k2/rusys/blob/main/docs/monitoring/DASHBOARDS-AND-ALERTS.md',
            __dashboardUid__: `rusys-${spec.dashboard}`,
            __panelId__: String(spec.panelId),
        },
        notification_settings: {
            receiver,
            group_by: ['grafana_folder', 'alertname'],
            group_wait: '30s',
            group_interval: '5m',
            repeat_interval: '4h',
        },
        data: [
            {
                refId: 'A',
                datasourceUid: sources[spec.source],
                relativeTimeRange: { from: 900, to: 0 },
                queryType: 'instant',
                model: {
                    refId: 'A',
                    datasource: { type: spec.source, uid: sources[spec.source] },
                    expr: spec.expr,
                    instant: true,
                    range: false,
                    queryType: 'instant',
                    intervalMs: 1000,
                    maxDataPoints: 43200,
                },
            },
            {
                refId: 'B',
                datasourceUid: '__expr__',
                relativeTimeRange: { from: 0, to: 0 },
                model: {
                    refId: 'B',
                    type: 'threshold',
                    expression: 'A',
                    datasource: { type: '__expr__', uid: '__expr__' },
                    conditions: [
                        {
                            evaluator: { type: 'gt', params: [0.5] },
                            operator: { type: 'and' },
                            reducer: { type: 'last', params: [] },
                            type: 'query',
                            query: { params: ['B'] },
                        },
                    ],
                },
            },
        ],
    }));
}
