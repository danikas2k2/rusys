import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import type { Product } from '~/common/data';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { ReviewProductRow } from '~/features/review/ReviewProductRow';
import { ReviewTable } from '~/features/review/ReviewTable';
import { useProducts } from '~/store/products';

vi.mock(import('~/features/review/ReviewProductRow'), () => ({
    ReviewProductRow: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/features/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(),
}));
vi.mock(import('~/store/products/useProducts'), () => ({
    useProducts: vi.fn(),
}));

describe('<ReviewTable>', () => {
    const products: Product[] = [
        { group: 'Uogienės', name: 'Avietės', years: [{ year: 23, amounts: [] }] },
        { group: 'Uogienės', name: 'Braškės', years: [{ year: 22, amounts: [] }] },
        { group: 'Uogienės', name: 'Serbentai', years: [] },
        { group: 'Daržovės', name: 'Morkos', years: [{ year: 22, amounts: [] }] },
    ];
    const onToggle = vi.fn();
    const onSelectAll = vi.fn();
    const onReset = vi.fn();

    beforeEach(() => {
        vi.mocked(useProducts).mockReturnValue(products);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders the table', () => {
        render(
            <MockTheme>
                <ReviewTable
                    group="Uogienės"
                    touched={false}
                    checkedKeys={new Set()}
                    onToggle={onToggle}
                    onSelectAll={onSelectAll}
                    onReset={onReset}
                />
            </MockTheme>
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders only products for the given group with recorded stock', () => {
        render(
            <MockTheme>
                <ReviewTable
                    group="Uogienės"
                    touched={false}
                    checkedKeys={new Set()}
                    onToggle={onToggle}
                    onSelectAll={onSelectAll}
                    onReset={onReset}
                />
            </MockTheme>
        );

        // Serbentai is excluded: same group but no recorded years
        expect(ReviewProductRow).toHaveBeenCalledTimes(2);
        expect(ReviewProductRow).toHaveBeenCalledWith(expect.objectContaining({ product: products[0] }), undefined);
        expect(ReviewProductRow).toHaveBeenCalledWith(expect.objectContaining({ product: products[1] }), undefined);
    });

    it('hides rows that do not match the quick filter', () => {
        vi.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => name === 'Avietės');

        render(
            <MockTheme>
                <ReviewTable
                    group="Uogienės"
                    touched={false}
                    checkedKeys={new Set()}
                    onToggle={onToggle}
                    onSelectAll={onSelectAll}
                    onReset={onReset}
                />
            </MockTheme>
        );

        expect(ReviewProductRow).toHaveBeenCalledWith(
            expect.objectContaining({ product: products[0], hidden: false }),
            undefined
        );
        expect(ReviewProductRow).toHaveBeenCalledWith(
            expect.objectContaining({ product: products[1], hidden: true }),
            undefined
        );
    });

    describe('master checkbox', () => {
        it('renders untouched (unchecked, marked data-untouched) when the group has not been touched', () => {
            render(
                <MockTheme>
                    <ReviewTable
                        group="Uogienės"
                        touched={false}
                        checkedKeys={new Set()}
                        onToggle={onToggle}
                        onSelectAll={onSelectAll}
                        onReset={onReset}
                    />
                </MockTheme>
            );

            const master = screen.getByRole('checkbox', { name: 'Uogienės' });

            expect(master).not.toBeChecked();
            expect(master).toHaveAttribute('data-untouched', 'true');
        });

        it('clicking while untouched selects all as unchecked', async () => {
            render(
                <MockTheme>
                    <ReviewTable
                        group="Uogienės"
                        touched={false}
                        checkedKeys={new Set()}
                        onToggle={onToggle}
                        onSelectAll={onSelectAll}
                        onReset={onReset}
                    />
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox', { name: 'Uogienės' }));

            expect(onSelectAll).toHaveBeenCalledWith(['Uogienės:Avietės', 'Uogienės:Braškės'], false);
        });

        it('renders normal (touched) unchecked when touched with nothing checked', () => {
            render(
                <MockTheme>
                    <ReviewTable
                        group="Uogienės"
                        touched
                        checkedKeys={new Set()}
                        onToggle={onToggle}
                        onSelectAll={onSelectAll}
                        onReset={onReset}
                    />
                </MockTheme>
            );

            const master = screen.getByRole('checkbox', { name: 'Uogienės' });

            expect(master).not.toBeChecked();
            expect(master).toHaveAttribute('data-untouched', 'false');
        });

        it('clicking when touched and all unchecked selects all as checked', async () => {
            render(
                <MockTheme>
                    <ReviewTable
                        group="Uogienės"
                        touched
                        checkedKeys={new Set()}
                        onToggle={onToggle}
                        onSelectAll={onSelectAll}
                        onReset={onReset}
                    />
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox', { name: 'Uogienės' }));

            expect(onSelectAll).toHaveBeenCalledWith(['Uogienės:Avietės', 'Uogienės:Braškės'], true);
        });

        it('renders indeterminate when touched with a mixed selection', () => {
            render(
                <MockTheme>
                    <ReviewTable
                        group="Uogienės"
                        touched
                        checkedKeys={new Set(['Uogienės:Avietės'])}
                        onToggle={onToggle}
                        onSelectAll={onSelectAll}
                        onReset={onReset}
                    />
                </MockTheme>
            );

            expect(screen.getByRole('checkbox', { name: 'Uogienės' })).toHaveProperty('indeterminate', true);
        });

        it('clicking with a mixed selection selects all as unchecked', async () => {
            render(
                <MockTheme>
                    <ReviewTable
                        group="Uogienės"
                        touched
                        checkedKeys={new Set(['Uogienės:Avietės'])}
                        onToggle={onToggle}
                        onSelectAll={onSelectAll}
                        onReset={onReset}
                    />
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox', { name: 'Uogienės' }));

            expect(onSelectAll).toHaveBeenCalledWith(['Uogienės:Avietės', 'Uogienės:Braškės'], false);
        });

        it('renders checked when touched and everything is checked', () => {
            render(
                <MockTheme>
                    <ReviewTable
                        group="Uogienės"
                        touched
                        checkedKeys={new Set(['Uogienės:Avietės', 'Uogienės:Braškės'])}
                        onToggle={onToggle}
                        onSelectAll={onSelectAll}
                        onReset={onReset}
                    />
                </MockTheme>
            );

            const master = screen.getByRole('checkbox', { name: 'Uogienės' });

            expect(master).toBeChecked();
            expect(master).toHaveAttribute('data-untouched', 'false');
        });

        it('clicking when everything is checked resets the group to untouched', async () => {
            render(
                <MockTheme>
                    <ReviewTable
                        group="Uogienės"
                        touched
                        checkedKeys={new Set(['Uogienės:Avietės', 'Uogienės:Braškės'])}
                        onToggle={onToggle}
                        onSelectAll={onSelectAll}
                        onReset={onReset}
                    />
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox', { name: 'Uogienės' }));

            expect(onReset).toHaveBeenCalledWith(['Uogienės:Avietės', 'Uogienės:Braškės']);
        });
    });
});
