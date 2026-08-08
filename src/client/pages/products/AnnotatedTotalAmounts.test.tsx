import { render } from '@testing-library/react';

import React from 'react';

import { AmountSuffix } from '~/client/common/AmountSuffix';
import { AnnotatedTotalAmounts } from '~/client/pages/products/AnnotatedTotalAmounts';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { useVariantsByGroup } from '~/client/state/variants/useVariantsByGroup';

vi.mock(import('~/client/state/variants/useGroupVariantComparator'), () => ({
    useGroupVariantComparator: vi.fn().mockReturnValue(() => 0),
}));
vi.mock(import('~/client/common/AmountSuffix'), () => ({
    AmountSuffix: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/client/state/variants/useVariantsByGroup'), () => ({
    useVariantsByGroup: vi.fn().mockReturnValue([]),
}));

describe('<AnnotatedTotalAmounts>', () => {
    const group = 'Uogienės';

    afterEach(() => vi.clearAllMocks());

    it('shows the converted total next to a parenthesized breakdown of its raw sources', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([
            { group, variant: 'p', order: 0, units: 'l', count: 1 },
            { group, variant: 'd', order: 1, units: 'l', count: 1 },
        ]);

        const { container } = render(
            <AnnotatedTotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 3 },
                    { variant: 'd', amount: 4 },
                ]}
            />
        );

        const totalSpan = container.querySelector('[data-total="volume"]');

        expect(totalSpan).toHaveTextContent('7l');

        // The comma between sources is CSS-generated (::after), not real DOM text - textContent
        // only ever shows the raw numbers back to back.
        const sources = totalSpan!.querySelector('[data-sources]');

        expect(sources).toHaveTextContent('(34)');
        expect(sources!.querySelectorAll('[data-value]')).toHaveLength(2);
    });

    it('gives each unit-family total its own sources, independent of the other', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([
            { group, variant: 'p', order: 0, units: 'l', count: 1 },
            { group, variant: 'd', order: 1, units: 'kg', count: 1 },
        ]);

        const { container } = render(
            <AnnotatedTotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 5 },
                    { variant: 'd', amount: 2 },
                ]}
            />
        );

        const volume = container.querySelector('[data-total="volume"]');
        const weight = container.querySelector('[data-total="weight"]');

        expect(volume).toHaveTextContent('5l');
        expect(volume!.querySelector('[data-sources]')).toHaveTextContent('(5)');
        expect(weight).toHaveTextContent('2kg');
        expect(weight!.querySelector('[data-sources]')).toHaveTextContent('(2)');
    });

    it('gives a count total its own sources too', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'vnt' }]);

        const { container } = render(<AnnotatedTotalAmounts group={group} amounts={[{ variant: 'p', amount: 6 }]} />);

        const count = container.querySelector('[data-total="count"]');

        expect(count).toHaveTextContent('6');
        expect(count!.querySelector('[data-sources]')).toHaveTextContent('(6)');
    });

    it('appends unitless amounts after the unit-aware totals, unannotated', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'l', count: 1 }]);

        const { container } = render(
            <AnnotatedTotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 3 },
                    { variant: 'x', amount: 7 },
                ]}
            />
        );

        const row = container.querySelector('[data-amounts-row]')!;

        expect(row.querySelector('[data-total="volume"] [data-sources]')).toHaveTextContent('(3)');
        // The unitless entry has no [data-sources] annotation of its own - it's shown as-is.
        expect(row).toHaveTextContent('3l(3)7');
    });

    it('keeps sources scoped to their own expiry-status row', () => {
        const now = new Date().getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'l', count: 1 }]);

        const { container } = render(
            <AnnotatedTotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 3 },
                    { variant: 'p', amount: 1, expiresAt: now - 5 * dayMs },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(2);
        expect(rows[0].querySelector('[data-sources]')).toHaveTextContent('(3)');
        expect(rows[1]).toHaveAttribute('data-expires', 'expired');
        expect(rows[1].querySelector('[data-sources]')).toHaveTextContent('(1)');
    });

    it('calls useGroupVariantComparator with the group for the unitless fallback', () => {
        render(<AnnotatedTotalAmounts group={group} amounts={[{ variant: 'p', amount: 3 }]} />);

        expect(useGroupVariantComparator).toHaveBeenCalledWith(group);
    });

    it('routes source and unitless amounts through AmountSuffix', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'l', count: 1 }]);

        render(
            <AnnotatedTotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 3 },
                    { variant: 'x', amount: 7 },
                ]}
            />
        );

        expect(AmountSuffix).toHaveBeenCalledWith(expect.objectContaining({ group, variant: 'p' }), undefined);
        expect(AmountSuffix).toHaveBeenCalledWith(expect.objectContaining({ group, variant: 'x' }), undefined);
    });
});
