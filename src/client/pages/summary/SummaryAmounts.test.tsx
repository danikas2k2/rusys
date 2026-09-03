import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { getAmountTotals } from '@rusys/common/utils/amounts';
import React from 'react';

import { Amounts } from '~/client/common/Amounts';
import { useAmountView } from '~/client/common/AmountViewContext';
import { SummaryAmounts } from '~/client/pages/summary/SummaryAmounts';

vi.mock(import('~/client/common/Amounts'), () => ({
    Amounts: vi.fn(({ type, amounts }: { type: string; amounts: readonly { amount: number }[] }) => (
        <span data-amount-type={type}>{amounts.map(({ amount }) => amount).join(',')}</span>
    )),
}));
vi.mock(import('~/client/common/AmountSuffix'), () => ({ AmountSuffix: vi.fn(() => null) }));
vi.mock(import('~/client/common/AmountViewContext'), () => ({ useAmountView: vi.fn(() => ['detailed']) }));
vi.mock(import('~/client/state/variants/useGroupVariantComparator'), () => ({
    useGroupVariantComparator: vi.fn(() => (a: string, b: string) => a.localeCompare(b)),
}));
vi.mock(import('~/client/state/variants/useVariantsByGroup'), () => ({ useVariantsByGroup: vi.fn(() => []) }));
vi.mock(import('@rusys/common/utils/amounts'), async () => ({
    ...(await vi.importActual('@rusys/common/utils/amounts')),
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

        expect(Amounts).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'consumed', amounts: [{ variant: 'p', amount: 2, recycled: false }] }),
            undefined
        );
        expect(Amounts).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'recycled', amounts: [{ variant: 'd', amount: 3, recycled: true }] }),
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
