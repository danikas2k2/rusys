import { stderr, stdout } from 'node:process';

const events = ['server_started', 'api_handler_failed', 'request_failed', 'runtime_output_redacted'] as const;
type LogEvent = (typeof events)[number];
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogDetails {
    method?: unknown;
    routeType?: unknown;
    status?: unknown;
}

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const routeTypes = ['render', 'route', 'action', 'proxy'];

/** Only static events and explicitly allowlisted values may cross the logging boundary.
 * Never serialize arbitrary objects, exception messages/stacks, headers, paths or bodies.
 */
export function logEvent(event: LogEvent, details: LogDetails = {}, level: LogLevel = 'info'): void {
    const entry = {
        timestamp: new Date().toISOString(),
        level: ['debug', 'info', 'warn', 'error'].includes(level) ? level : 'info',
        service: 'rusys-web',
        slot: ['blue', 'green'].includes(process.env.APP_SLOT ?? '') ? process.env.APP_SLOT : 'unknown',
        version: /^\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(process.env.APP_VERSION ?? '')
            ? process.env.APP_VERSION
            : 'unknown',
        event: events.includes(event) ? event : 'runtime_output_redacted',
        ...(typeof details.method === 'string' && methods.includes(details.method) ? { method: details.method } : {}),
        ...(typeof details.routeType === 'string' && routeTypes.includes(details.routeType)
            ? { routeType: details.routeType }
            : {}),
        ...(typeof details.status === 'number' &&
        Number.isInteger(details.status) &&
        details.status >= 100 &&
        details.status <= 599
            ? { status: details.status }
            : {}),
    };
    (level === 'error' || level === 'warn' ? stderr : stdout).write(`${JSON.stringify(entry)}\n`);
}

/** Third-party console arguments can include request data. Replace them before emission. */
export function installConsoleLogging(): void {
    for (const method of ['log', 'info', 'debug', 'warn', 'error'] as const) {
        // eslint-disable-next-line no-console -- Central privacy boundary for framework and dependency console output.
        console[method] = () => logEvent('runtime_output_redacted', {}, method === 'log' ? 'info' : method);
    }
    for (const method of [
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
        // eslint-disable-next-line no-console -- These console methods can also serialize arbitrary application data.
        console[method] = () => logEvent('runtime_output_redacted');
    }
}
