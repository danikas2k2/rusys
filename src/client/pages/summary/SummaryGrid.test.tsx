import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { SummaryGrid } from '~/client/pages/summary/SummaryGrid';
import { useSummary } from '~/client/state/summary/useSummary';
import { useYears } from '~/client/state/years/useYears';

vi.mock(import('~/client/filters/GroupFilterContext'), () => ({ useGroupFilter: vi.fn() }));
vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'), () => ({ useQuickFilterPredicate: vi.fn() }));
vi.mock(import('~/client/pages/summary/hooks/useSummaryHasData'), () => ({ useSummaryHasData: vi.fn() }));
vi.mock(import('~/client/state/summary/useSummary'), () => ({ useSummary: vi.fn() }));
vi.mock(import('~/client/state/years/useYears'), () => ({ useYears: vi.fn() }));
vi.mock(import('~/client/common/LoadableContent'), () => ({
    LoadableContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('<SummaryGrid>', () => {
    beforeEach(() => {
        vi.mocked(useSummaryHasData).mockReturnValue(true);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);
        vi.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => name === 'Avietės');
        vi.mocked(useYears).mockReturnValue([23]);
        vi.mocked(useSummary).mockReturnValue([
            {
                group: 'Uogienės',
                name: 'Avietės',
                years: [{ year: 22, amounts: [{ variant: 'p', amount: 5, recycled: false }] }],
            },
            { group: 'Uogienės', name: 'Braškės', years: [] },
            { group: 'Daržovės', name: 'Agurkai', years: [] },
        ]);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders selected-category tiles and hides filtered ones', () => {
        render(
            <MockApp>
                <SummaryGrid />
            </MockApp>
        );

        const firstAvailableYearTile = screen.getByText('Avietės').closest('[data-summary-tile]');

        expect(firstAvailableYearTile).toHaveAttribute('data-hidden', 'false');
        expect(firstAvailableYearTile).toHaveAttribute('data-year', '22');
        expect(firstAvailableYearTile).toHaveTextContent('5');
        expect(screen.getByText('Braškės').closest('[data-summary-tile]')).toHaveAttribute('data-hidden', 'true');
        expect(screen.queryByText('Agurkai')).not.toBeInTheDocument();
    });
});
