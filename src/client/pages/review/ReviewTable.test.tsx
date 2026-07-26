import { render, screen } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { ReviewGroup } from '~/client/pages/review/ReviewGroup';
import { ReviewTable } from '~/client/pages/review/ReviewTable';
import { useProducts } from '~/client/state/products/useProducts';
import type { Group } from '~/types/data';

vi.mock(import('~/client/pages/review/ReviewGroup'), () => ({
    ReviewGroup: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/client/pages/groups/hooks/useSortedGroups'), () => ({
    useSortedGroups: vi.fn(),
}));
vi.mock(import('~/client/state/products/useProducts'), () => ({
    useProducts: vi.fn(),
}));

describe('<ReviewTable>', () => {
    const products = getProductsFixture();
    const groups: Group[] = [
        { group: 'Uogienės', order: 0, review: true },
        { group: 'Daržovės', order: 1, review: false },
        { group: 'Šaldyti', order: 2, review: true },
    ];
    const onToggle = vi.fn();

    beforeEach(() => {
        vi.mocked(useSortedGroups).mockReturnValue(groups);
        vi.mocked(useProducts).mockReturnValue(products);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders the table', () => {
        render(
            <MockTheme>
                <ReviewTable checkedKeys={new Set()} onToggle={onToggle} />
            </MockTheme>
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders only groups flagged for review', () => {
        render(
            <MockTheme>
                <ReviewTable checkedKeys={new Set()} onToggle={onToggle} />
            </MockTheme>
        );

        expect(ReviewGroup).toHaveBeenCalledTimes(2);
        expect(ReviewGroup).toHaveBeenCalledWith(expect.objectContaining({ group: groups[0], products }), undefined);
        expect(ReviewGroup).toHaveBeenCalledWith(expect.objectContaining({ group: groups[2], products }), undefined);
    });

    it('passes checkedKeys and onToggle through to each group', () => {
        const checkedKeys = new Set(['Uogienės:Avietės']);

        render(
            <MockTheme>
                <ReviewTable checkedKeys={checkedKeys} onToggle={onToggle} />
            </MockTheme>
        );

        expect(ReviewGroup).toHaveBeenCalledWith(expect.objectContaining({ checkedKeys, onToggle }), undefined);
    });

    it('renders nothing when no group is flagged for review', () => {
        vi.mocked(useSortedGroups).mockReturnValue(groups.map((g) => ({ ...g, review: false })));

        render(
            <MockTheme>
                <ReviewTable checkedKeys={new Set()} onToggle={onToggle} />
            </MockTheme>
        );

        expect(ReviewGroup).not.toHaveBeenCalled();
    });
});
