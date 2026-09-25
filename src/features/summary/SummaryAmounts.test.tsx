import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { getAmountTotals } from '~/common/utils/amounts';
import { useAmountView } from '~/components/amounts/AmountViewContext';
import { AnnotatedTotalAmounts } from '~/components/amounts/AnnotatedTotalAmounts';
import { SummaryAmounts } from '~/features/summary/SummaryAmounts';

vi.mock(import('~/components/amounts/AnnotatedTotalAmounts'), () => ({
    AnnotatedTotalAmounts: vi.fn(({ amounts }: { amounts: readonly { amount: number }[] }) => (
        <span>{amounts.map(({ amount }) => amount).join(',')}</span>
    )),
}));
vi.mock(import('~/components/amounts/AmountSuffix'), () => ({ AmountSuffix: vi.fn(() => null) }));
vi.mock(import('~/components/amounts/AmountViewContext'), () => ({ useAmountView: vi.fn(() => ['detailed']) }));
vi.mock(import('~/store/variants/useGroupVariantComparator'), () => ({
    useGroupVariantComparator: vi.fn(() => (a: string, b: string) => a.localeCompare(b)),
}));
vi.mock(import('~/store/variants/useVariantsByGroup'), () => ({ useVariantsByGroup: vi.fn(() => []) }));
vi.mock(import('~/common/utils/amounts'), async () => ({
    ...(await vi.importActual('~/common/utils/amounts')),
    getAmountTotals: vi.fn(),
}));

describe('<SummaryAmounts>', () => {
    it('shows a placeholder when there are no relevant amounts', () => {
        render(<SummaryAmounts group="Uogienės" amounts={[]} />);

        expect(screen.getByText('.')).toBeInTheDocument();
    });

    it('partitions consumed, recycled and home amounts', () => {
        render(
            <MockTheme>
                <SummaryAmounts
                    group="Uogienės"
                    amounts={[
                        { variant: 'p', amount: 2, recycled: false },
                        { variant: 'd', amount: 3, recycled: true },
                        { variant: 'h', amount: 1, home: true },
                    ]}
                />
            </MockTheme>
        );

        expect(AnnotatedTotalAmounts).toHaveBeenCalledWith(
            expect.objectContaining({ group: 'Uogienės', amounts: [{ variant: 'p', amount: 2, recycled: false }] }),
            undefined
        );
        expect(AnnotatedTotalAmounts).toHaveBeenCalledWith(
            expect.objectContaining({ group: 'Uogienės', amounts: [{ variant: 'd', amount: 3, recycled: true }] }),
            undefined
        );
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('uses slash-separated inline sections', () => {
        render(
            <MockTheme>
                <SummaryAmounts
                    group="Uogienės"
                    inline
                    amounts={[
                        { variant: 'p', amount: 2, recycled: false },
                        { variant: 'd', amount: 3, recycled: true },
                    ]}
                />
            </MockTheme>
        );

        expect(screen.getByText('/')).toBeInTheDocument();
        expect(document.querySelector('[data-summary-amounts-inline]')).toBeInTheDocument();
    });

    it('formats every home total type in total view', () => {
        vi.mocked(useAmountView).mockReturnValue(['total', vi.fn()]);
        vi.mocked(getAmountTotals).mockReturnValue({
            volume: 1000,
            weight: 1000,
            count: 2,
            unitless: [{ variant: 'p', amount: 3 }],
        });

        render(
            <MockTheme>
                <SummaryAmounts group="Uogienės" amounts={[{ variant: 'h', amount: 1, home: true }]} />
            </MockTheme>
        );

        expect(screen.getAllByText('1')).toHaveLength(2);
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });
});
