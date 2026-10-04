import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useSummaryHasData } from '~/features/summary/hooks/useSummaryHasData';
import { SummaryGrid } from '~/features/summary/SummaryGrid';
import { useSummary } from '~/store/summary';
import { useYears } from '~/store/years';

vi.mock(import('~/features/filters/GroupFilterContext'), () => ({ useGroupFilter: vi.fn() }));
vi.mock(import('~/features/filters/hooks/useQuickFilterPredicate'), () => ({ useQuickFilterPredicate: vi.fn() }));
vi.mock(import('~/features/summary/hooks/useSummaryHasData'), () => ({ useSummaryHasData: vi.fn() }));
vi.mock(import('~/store/summary/useSummary'), () => ({ useSummary: vi.fn() }));
vi.mock(import('~/store/years/useYears'), () => ({ useYears: vi.fn() }));
vi.mock(import('~/components/common/LoadableContent'), () => ({
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
            { group: 'Daržovės', name: 'Morkos', years: [] },
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
        expect(screen.queryByText('Morkos')).not.toBeInTheDocument();
    });
});
