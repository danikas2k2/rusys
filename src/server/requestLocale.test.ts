import { headers } from 'next/headers';

import { getRequestLocale } from '~/server/requestLocale';

vi.mock(import('next/headers'), () => ({ headers: vi.fn() }));

describe('getRequestLocale', () => {
    it.each([
        ['lt-LT, en-US', 'lt-LT'],
        ['en-US, lt-LT;q=0.5', 'en-US'],
        [null, 'en-US'],
    ] as const)('resolves %s to %s', async (acceptLanguage, expected) => {
        vi.mocked(headers).mockResolvedValue(new Headers(acceptLanguage ? { 'accept-language': acceptLanguage } : {}));

        await expect(getRequestLocale()).resolves.toBe(expected);
        expect(headers).toHaveBeenCalledOnce();
        vi.clearAllMocks();
    });
});
