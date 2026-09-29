import React from 'react';
import { renderToString } from 'react-dom/server';

import { NextApp } from '~/components/app/NextApp';

const route = vi.hoisted(() => ({ pathname: '/categories' }));

vi.mock(import('next/navigation'), () => ({
    usePathname: () => route.pathname,
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({ refresh: vi.fn() }),
}));

describe('server-loaded categories', () => {
    afterEach(() => {
        route.pathname = '/categories';
        vi.unstubAllGlobals();
    });

    it('renders category data without making an API request', () => {
        vi.stubGlobal('localStorage', undefined);
        vi.stubGlobal('fetch', vi.fn());

        const markup = renderToString(
            <NextApp
                clientId="dev-mode"
                initialData={{ groups: [{ group: 'Test category', order: 0 }] }}
                initialResource="groups"
            />
        );

        expect(markup).toContain('Test category');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('renders product data without making an API request', () => {
        route.pathname = '/products';
        vi.stubGlobal('localStorage', undefined);
        vi.stubGlobal('fetch', vi.fn());

        const markup = renderToString(
            <NextApp
                clientId="dev-mode"
                initialData={{
                    groups: [
                        { group: 'Empty category', order: 0 },
                        { group: 'Test category', order: 1 },
                    ],
                    variants: [{ group: 'Test category', variant: 'Unit', order: 0 }],
                    years: [26],
                    products: [{ group: 'Test category', name: 'Test product' }],
                }}
                initialGroup="Test category"
                initialResource="products"
            />
        );

        expect(markup).toContain('Test product');
        expect(fetch).not.toHaveBeenCalled();
    });
});
