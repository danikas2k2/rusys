import { NextRequest } from 'next/server';

import { LOCALE_COOKIE } from '~/lib/locale';
import { proxy } from '~/proxy';

describe('locale proxy', () => {
    it.each([
        ['lt-LT', 'lt-LT, en-US'],
        ['en-US', 'en-US'],
    ])('passes %s as Accept-Language to the app', (locale, expected) => {
        const request = new NextRequest('https://rusys.test/products', {
            headers: { cookie: `${LOCALE_COOKIE}=${locale}`, 'accept-language': 'fr-FR' },
        });

        const response = proxy(request);

        expect(response.headers.get('x-middleware-request-accept-language')).toBe(expected);
    });

    it('preserves the browser language when no valid choice was saved', () => {
        const request = new NextRequest('https://rusys.test/products', {
            headers: { cookie: `${LOCALE_COOKIE}=de-DE`, 'accept-language': 'lt-LT' },
        });

        const response = proxy(request);

        expect(response.headers.get('x-middleware-request-accept-language')).toBeNull();
    });
});
