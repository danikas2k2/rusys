import { FARO_ALLOWED_ORIGINS, faroCollectorUrl } from './faroConfig';

describe('faro collector configuration', () => {
    it('accepts a Grafana HTTPS collector and the exact Rusys origin', () => {
        expect(faroCollectorUrl('https://faro-collector-test.grafana.net/collect/public-key')).toBe(
            'https://faro-collector-test.grafana.net/collect/public-key'
        );
        expect(FARO_ALLOWED_ORIGINS).toStrictEqual(['https://rusys.andriaus.com']);
    });

    it.each([
        undefined,
        '',
        'invalid',
        'http://faro-collector-test.grafana.net/collect/key',
        'https://faro-collector-test.grafana.net.evil.test/collect/key',
        'https://faro-collector-test.grafana.net:444/collect/key',
        'https://user:password@faro-collector-test.grafana.net/collect/key',
        'https://faro-collector-test.grafana.net/collect/key?secret=value',
        'https://faro-collector-test.grafana.net/collect/key#fragment',
        'https://faro-collector-test.grafana.net/api/key',
    ])('rejects missing or unsafe configuration %s', (value) => {
        expect(faroCollectorUrl(value)).toBeUndefined();
    });
});
