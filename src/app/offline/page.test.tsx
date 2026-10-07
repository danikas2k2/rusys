import { render, screen } from '@testing-library/react';

import { getRequestLocale } from '~/server/requestLocale';
import OfflinePage, { generateMetadata } from './page';

vi.mock(import('~/server/requestLocale'), () => ({ getRequestLocale: vi.fn() }));

describe('offline page', () => {
    it.each([
        ['lt-LT', 'Nėra ryšio · Rūsys', 'Nėra interneto ryšio'],
        ['en-US', 'No connection · Cellar', 'No internet connection'],
    ] as const)('renders %s using the request language', async (locale, title, heading) => {
        vi.mocked(getRequestLocale).mockResolvedValue(locale);

        expect(await generateMetadata()).toMatchObject({ title });
        render(await OfflinePage());

        expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/');
        expect(getRequestLocale).toHaveBeenCalledTimes(2);
        vi.clearAllMocks();
    });
});
