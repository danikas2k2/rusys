import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { ProductRow } from '~/client/pages/products/ProductRow';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import { useYears } from '~/client/state/years/useYears';
import { SwipeableRow } from '~/client/table/SwipeableRow';

vi.mock(import('~/client/state/products/useSetProductMissing'), () => ({
    useSetProductMissing: vi.fn(),
}));
vi.mock(import('~/client/state/products/useSetProductRemoving'), () => ({
    useSetProductRemoving: vi.fn(),
}));
vi.mock(import('~/client/state/profile/useProfile'));
vi.mock(import('~/client/state/years/useYears'));
vi.mock(import('~/client/table/SwipeableRow'), async () => {
    const actual = await vi.importActual('~/client/table/SwipeableRow');
    return {
        ...actual,
        SwipeableRow: vi.fn(actual.SwipeableRow),
    };
});

describe('<ProductRow>', () => {
    const user = userEvent.setup();
    const products = getProductsFixture();
    const product = products[0];
    const years = getYearsFixture();

    const setMissing = vi.fn();
    const setRemoving = vi.fn();

    beforeEach(() => {
        vi.mocked(useYears).mockReturnValue(years);
        vi.mocked(useSetProductMissing).mockReturnValue(setMissing);
        vi.mocked(useSetProductRemoving).mockReturnValue(setRemoving);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('passes the full product (including parent) as the active row data, for the edit dialog to pick up', () => {
        const productWithParent = { ...product, parent: 'Some Parent' };
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={productWithParent} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(SwipeableRow).toHaveBeenCalledWith(expect.objectContaining({ data: productWithParent }), undefined);
    });

    it('renders a row with title and cells', () => {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={product} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(screen.getByRole('row')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getAllByRole('cell')).toHaveLength(years.length + 1);
    });

    it('hides row when hidden flag is set', () => {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={product} hidden />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(screen.getByRole('row')).toHaveAttribute('data-hidden', 'true');
    });

    it('toggles missing on checkbox click', async () => {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={{ ...product, missing: false }} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissing).toHaveBeenCalledWith(product.group, product.name, true);
    });

    it('does not render an expand chevron when hasChildren is false', () => {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={product} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
    });

    it('renders an expand chevron and calls onToggleExpand when hasChildren is true', async () => {
        const onToggleExpand = vi.fn();
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={product} hasChildren onToggleExpand={onToggleExpand} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(onToggleExpand).toHaveBeenCalledWith();
    });

    it('renders the rolled-up total instead of the product own amount when rolledUpYears is given', () => {
        render(
            <MockApp state={{ variants: [{ group: product.group, variant: 'p', order: 0 }] }}>
                <Table>
                    <Table.Tbody>
                        <ProductRow
                            product={product}
                            annual={false}
                            rolledUpYears={[{ year: 21, amounts: [{ variant: 'p', amount: 99 }] }]}
                        />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(screen.getAllByRole('cell')[1]).toHaveTextContent('99');
    });
});
