import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { ReviewProductRow } from '~/client/pages/review/ReviewProductRow';
import { ReviewTable } from '~/client/pages/review/ReviewTable';
import { useProducts } from '~/client/state/products/useProducts';
import type { Product } from '~/types/data';

vi.mock(import('~/client/pages/review/ReviewProductRow'), () => ({
    ReviewProductRow: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(),
}));
vi.mock(import('~/client/state/products/useProducts'), () => ({
    useProducts: vi.fn(),
}));

describe('<ReviewTable>', () => {
    const products: Product[] = [
        { group: 'Uogienės', name: 'Avietės', years: [{ year: 23, amounts: [] }] },
        { group: 'Uogienės', name: 'Braškės', years: [] },
        { group: 'Daržovės', name: 'Agurkai', years: [{ year: 22, amounts: [] }] },
    ];
    const onToggle = vi.fn();

    beforeEach(() => {
        vi.mocked(useProducts).mockReturnValue(products);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders the table', () => {
        render(
            <MockTheme>
                <ReviewTable group="Uogienės" checkedKeys={new Set()} onToggle={onToggle} />
            </MockTheme>
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders only products for the given group with recorded stock', () => {
        render(
            <MockTheme>
                <ReviewTable group="Uogienės" checkedKeys={new Set()} onToggle={onToggle} />
            </MockTheme>
        );

        // Braškės is excluded: same group but no recorded years
        expect(ReviewProductRow).toHaveBeenCalledTimes(1);
        expect(ReviewProductRow).toHaveBeenCalledWith(expect.objectContaining({ product: products[0] }), undefined);
    });

    it('renders products for a different selected group', () => {
        render(
            <MockTheme>
                <ReviewTable group="Daržovės" checkedKeys={new Set()} onToggle={onToggle} />
            </MockTheme>
        );

        expect(ReviewProductRow).toHaveBeenCalledTimes(1);
        expect(ReviewProductRow).toHaveBeenCalledWith(expect.objectContaining({ product: products[2] }), undefined);
    });

    it('passes checked state and onToggle through to each row', () => {
        const checkedKeys = new Set(['Uogienės:Avietės']);

        render(
            <MockTheme>
                <ReviewTable group="Uogienės" checkedKeys={checkedKeys} onToggle={onToggle} />
            </MockTheme>
        );

        expect(ReviewProductRow).toHaveBeenCalledWith(expect.objectContaining({ checked: true, onToggle }), undefined);
    });

    it('hides rows that do not match the quick filter', () => {
        vi.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => name === 'Avietės');

        render(
            <MockTheme>
                <ReviewTable group="Uogienės" checkedKeys={new Set()} onToggle={onToggle} />
            </MockTheme>
        );

        expect(ReviewProductRow).toHaveBeenCalledWith(expect.objectContaining({ hidden: false }), undefined);
    });

    it('renders no rows when the selected group has no products with recorded stock', () => {
        render(
            <MockTheme>
                <ReviewTable group="Šaldyti" checkedKeys={new Set()} onToggle={onToggle} />
            </MockTheme>
        );

        expect(ReviewProductRow).not.toHaveBeenCalled();
    });
});
