import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React, { useState } from 'react';

import { refreshOfflinePage } from '~/components/app/ServiceWorker/Registration';
import { Label } from '~/components/common/Label';
import { LanguageToggle } from '~/components/runtime/LanguageToggle';
import { LocaleContext, SetLocaleContext } from '~/components/runtime/LocaleContext';
import { LOCALE_COOKIE, type AppLocale } from '~/lib/locale';

vi.mock(import('~/components/app/ServiceWorker/Registration'), () => ({
    refreshOfflinePage: vi.fn().mockResolvedValue(undefined),
}));

function LocaleShell({ initialLocale }: { initialLocale: AppLocale }) {
    const [locale, setLocale] = useState(initialLocale);
    return (
        <MockTheme>
            <SetLocaleContext value={setLocale}>
                <LocaleContext value={locale}>
                    <Label>Products</Label>
                    <LanguageToggle />
                </LocaleContext>
            </SetLocaleContext>
        </MockTheme>
    );
}

describe('<LanguageToggle>', () => {
    afterEach(() => {
        document.cookie = `${LOCALE_COOKIE}=; Path=/; Max-Age=0`;
        vi.mocked(refreshOfflinePage).mockClear();
        document.documentElement.lang = '';
        document.title = '';
    });

    it('defaults to the request locale and saves Lithuanian when selected', async () => {
        render(<LocaleShell initialLocale="en-US" />);

        const toggle = screen.getByRole('switch', { name: 'Switch to Lithuanian' });

        expect(toggle).not.toBeChecked();

        await user.click(toggle);

        expect(toggle).toBeChecked();
        expect(screen.getByText('Produktai')).toBeInTheDocument();
        expect(document.cookie).toContain(`${LOCALE_COOKIE}=lt-LT`);
        expect(document.documentElement.lang).toBe('lt');
        expect(document.title).toBe('Rusio programėlė');
        expect(refreshOfflinePage).toHaveBeenCalledTimes(1);
    });

    it('saves English when switched from Lithuanian', async () => {
        render(<LocaleShell initialLocale="lt-LT" />);

        const toggle = screen.getByRole('switch', { name: 'Perjungti į anglų kalbą' });

        expect(toggle).toBeChecked();

        await user.click(toggle);

        expect(toggle).not.toBeChecked();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(document.cookie).toContain(`${LOCALE_COOKIE}=en-US`);
        expect(document.documentElement.lang).toBe('en');
        expect(document.title).toBe('Cellar');
    });

    it('marks the saved preference secure on HTTPS', async () => {
        render(<LocaleShell initialLocale="en-US" />);
        const originalWindow = window;
        vi.stubGlobal(
            'window',
            new Proxy(originalWindow, {
                get(target, property) {
                    return property === 'location' ? { protocol: 'https:' } : Reflect.get(target, property);
                },
            })
        );

        try {
            await user.click(screen.getByRole('switch', { name: 'Switch to Lithuanian' }));

            expect(screen.getByText('Produktai')).toBeInTheDocument();
        } finally {
            vi.unstubAllGlobals();
        }
    });
});
