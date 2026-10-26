/** Exact production origins; keep Grafana Cloud's application allowlist in sync. */
export const FARO_ALLOWED_ORIGINS = ['https://rusys.andriaus.com'] as const;

/** A public ingestion URL, never a Grafana API token or a general-purpose endpoint. */
export function faroCollectorUrl(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    try {
        const url = new URL(value);
        if (
            url.protocol !== 'https:' ||
            !/^faro-collector-[a-z0-9-]+\.grafana\.net$/.test(url.hostname) ||
            !/^\/collect\/[a-zA-Z0-9-]+$/.test(url.pathname) ||
            url.port ||
            url.username ||
            url.password ||
            url.search ||
            url.hash
        ) {
            return undefined;
        }
        return url.href;
    } catch {
        return undefined;
    }
}
