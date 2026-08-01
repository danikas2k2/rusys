import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { ProductTitle } from '~/client/pages/products/ProductTitle';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { useYears } from '~/client/state/years/useYears';

vi.mock(import('~/client/state/products/useSetProductMissing'), () => ({
    useSetProductMissing: vi.fn(),
}));
vi.mock(import('~/client/state/profile/useProfile'));
vi.mock(import('~/client/state/years/useYears'));

describe('<ProductTitle>', () => {
    const user = userEvent.setup();
    const products = getProductsFixture();
    const years = getYearsFixture();

    const setMissing = vi.fn();

    beforeEach(() => {
        vi.mocked(useYears).mockReturnValue(years);
        vi.mocked(useSetProductMissing).mockReturnValue(setMissing);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    function renderTitle(product = products[0], props: Partial<React.ComponentProps<typeof ProductTitle>> = {}) {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <ProductTitle product={product} {...props} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockApp>
        );
    }

    it('renders available product checkbox as checked and enabled', () => {
        renderTitle(products[0]);

        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).toBeEnabled();
        expect(checkbox).toBeChecked();
        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-available', 'true');
    });

    it('renders missing product checkbox as unchecked', () => {
        renderTitle({ ...products[0], missing: true });

        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('disables checkbox and sets indeterminate for unavailable product', () => {
        renderTitle({ ...products[0], years: [] });

        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).toBeDisabled();
        expect(checkbox).toBePartiallyChecked();
        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-available', 'false');
    });

    it('marks removing state when any year is removing', () => {
        renderTitle({
            ...products[0],
            years: [{ year: years[0], removing: true, amounts: [{ variant: 'p', amount: 1 }] }],
        });

        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-removing', 'true');
    });

    it('sets data-removing to false when product.years is undefined', () => {
        renderTitle({ ...products[0], years: undefined });

        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-removing', 'false');
    });

    it('sets data-removing to false when removing year is not in allYears', () => {
        const yearNotInAllYears = 99;
        renderTitle({
            ...products[0],
            years: [{ year: yearNotInAllYears, removing: true, amounts: [{ variant: 'p', amount: 1 }] }],
        });

        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-removing', 'false');
    });

    it('calls setMissing on toggle when available', async () => {
        renderTitle({ ...products[0], missing: false });

        await user.click(screen.getByRole('checkbox'));

        expect(setMissing).toHaveBeenCalledWith(products[0].group, products[0].name, true);
    });

    it('does not call setMissing when unavailable', async () => {
        renderTitle({ ...products[0], years: [] });

        await user.click(screen.getByRole('checkbox'));

        expect(setMissing).not.toHaveBeenCalled();
    });

    it('skips setMissing in handleClick when available is false (fireEvent on input)', () => {
        renderTitle({ ...products[0], years: [] });

        // fireEvent.click on the input bypasses userEvent's disabled-check,
        // causing React to invoke onChange → handleClick with available=false
        const input = screen.getByRole('checkbox') as HTMLInputElement;
        fireEvent.click(input);

        expect(setMissing).not.toHaveBeenCalled();
    });

    describe('expand/collapse chevron', () => {
        it('does not render a chevron when hasChildren is false', () => {
            renderTitle(products[0], { hasChildren: false });

            expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Collapse' })).not.toBeInTheDocument();
        });

        it('renders an expand button when hasChildren is true and not expanded', () => {
            renderTitle(products[0], { hasChildren: true, expanded: false });

            expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument();
        });

        it('renders a collapse button when hasChildren is true and expanded', () => {
            renderTitle(products[0], { hasChildren: true, expanded: true });

            expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument();
        });

        it('calls onToggleExpand when the chevron is clicked', async () => {
            const onToggleExpand = vi.fn();
            renderTitle(products[0], { hasChildren: true, expanded: false, onToggleExpand });

            await user.click(screen.getByRole('button', { name: 'Expand' }));

            expect(onToggleExpand).toHaveBeenCalledWith();
        });

        it('clicking the chevron does not toggle the missing checkbox', async () => {
            const onToggleExpand = vi.fn();
            renderTitle({ ...products[0], missing: false }, { hasChildren: true, onToggleExpand });

            await user.click(screen.getByRole('button', { name: 'Expand' }));

            expect(setMissing).not.toHaveBeenCalled();
        });
    });

    describe('depth indentation', () => {
        it('applies no left padding at depth 0', () => {
            renderTitle(products[0], { depth: 0 });

            expect(screen.getByRole('cell').firstChild).toHaveStyle({ paddingInlineStart: '0px' });
        });

        it('applies proportional left padding for a non-zero depth', () => {
            renderTitle(products[0], { depth: 2 });

            expect(screen.getByRole('cell').firstChild).toHaveStyle({ paddingInlineStart: '32px' });
        });
    });
});
