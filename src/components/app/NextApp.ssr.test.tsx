import React from 'react';
import { renderToString } from 'react-dom/server';

import { NextApp } from '~/components/app/NextApp';

vi.mock(import('next/navigation'), () => ({
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock(import('~/components/common/LoadableContent'), () => ({
    LoadableContent: () => <div data-loading />,
}));

describe('application server rendering', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('renders the app shell without localStorage', () => {
        vi.stubGlobal('localStorage', undefined);
        const markup = renderToString(<NextApp clientId="dev-mode" />);

        expect(markup).toContain('data-loading');
    });
});
