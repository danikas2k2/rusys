import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { VariantsRow } from '~/client/pages/variants/VariantsRow';
import { useVariant } from '~/client/state/variants/useVariant';
import { SortableRow } from '~/client/table/SortableRow';

vi.mock(import('~/client/table/SortableRow'), () => ({
    SortableRow: vi.fn(({ children }: { children: React.ReactNode }) => <tr>{children}</tr>),
}));

vi.mock(import('~/client/state/variants/useVariant'), () => ({
    useVariant: vi.fn().mockReturnValue(undefined),
}));

describe('<VariantsRow>', () => {
    afterEach(() => vi.clearAllMocks());

    const renderRow = (props: React.ComponentProps<typeof VariantsRow>) =>
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <VariantsRow {...props} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

    it('renders variant name', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', order: 0 }, reordering: false });

        expect(screen.getByText('p')).toBeInTheDocument();
    });

    it('renders suffix when provided', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'd', suffix: 'D.', order: 0 }, reordering: false });

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders count and units when no name is set', () => {
        vi.mocked(useVariant).mockReturnValue({
            group: 'Uogienės', variant: '500ml', order: 0, count: 500, units: 'ml',
        });

        renderRow({
            variant: { group: 'Uogienės', variant: '500ml', order: 0, count: 500, units: 'ml' },
            reordering: false,
        });

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText(/ml\./)).toBeInTheDocument();
        expect(screen.queryByText('500ml')).not.toBeInTheDocument();
    });

    it('renders name with count as dimmed sub-text when name is provided', () => {
        vi.mocked(useVariant).mockReturnValue({
            group: 'Uogienės', variant: '500ml', name: 'Litriukas', order: 0, count: 500, units: 'ml',
        });

        renderRow({
            variant: { group: 'Uogienės', variant: '500ml', name: 'Litriukas', order: 0, count: 500, units: 'ml' },
            reordering: false,
        });

        expect(screen.getByText('Litriukas')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.queryByText('500ml')).not.toBeInTheDocument();
    });

    it('renders empty string when suffix is undefined', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', order: 0 }, reordering: false });

        const cells = screen.getAllByRole('cell');

        expect(cells[1]).toHaveTextContent('');
    });

    it('sets data-unused=true when variant.used is false', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', used: false, order: 0 }, reordering: false });

        const title = document.querySelector('[data-unused]');

        expect(title).toHaveAttribute('data-unused', 'true');
    });

    it('sets data-unused=true when variant.used is undefined', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', order: 0 }, reordering: false });

        const title = document.querySelector('[data-unused]');

        expect(title).toHaveAttribute('data-unused', 'true');
    });

    it('sets data-unused=false when variant.used is true', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', used: true, order: 0 }, reordering: false });

        const title = document.querySelector('[data-unused]');

        expect(title).toHaveAttribute('data-unused', 'false');
    });

    it('passes disabled=true when reordering=true', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', order: 0 }, reordering: true });

        const props = vi.mocked(SortableRow).mock.calls[0][0];

        expect(props.disabled).toBe(true);
    });

    it('passes disabled=true when hidden=true', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', order: 0 }, reordering: false, hidden: true });

        const props = vi.mocked(SortableRow).mock.calls[0][0];

        expect(props.disabled).toBe(true);
    });

    it('passes disabled=false when both reordering and hidden are false', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', order: 0 }, reordering: false, hidden: false });

        const props = vi.mocked(SortableRow).mock.calls[0][0];

        expect(props.disabled).toBe(false);
    });
});
