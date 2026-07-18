import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { SortableRow } from '~/client/table/SortableRow';
import { VariantsRow } from '~/client/pages/variants/VariantsRow';

jest.mock('~/client/table/SortableRow', () => ({
    SortableRow: jest.fn(({ children }) => <tr>{children}</tr>),
}));

describe('<VariantsRow>', () => {
    afterEach(() => jest.clearAllMocks());

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
        renderRow({ variant: { group: 'Uogienės', variant: 'p' }, reordering: false });

        expect(screen.getByText('p')).toBeInTheDocument();
    });

    it('renders suffix when provided', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'd', suffix: 'D.' }, reordering: false });

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders empty string when suffix is undefined', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p' }, reordering: false });

        const cells = screen.getAllByRole('cell');
        expect(cells[1]).toHaveTextContent('');
    });

    it('sets data-unused=true when variant.used is false', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', used: false }, reordering: false });

        const title = document.querySelector('[data-unused]');
        expect(title).toHaveAttribute('data-unused', 'true');
    });

    it('sets data-unused=true when variant.used is undefined', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p' }, reordering: false });

        const title = document.querySelector('[data-unused]');
        expect(title).toHaveAttribute('data-unused', 'true');
    });

    it('sets data-unused=false when variant.used is true', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', used: true }, reordering: false });

        const title = document.querySelector('[data-unused]');
        expect(title).toHaveAttribute('data-unused', 'false');
    });

    it('passes disabled=true when reordering=true', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p' }, reordering: true });

        const props = jest.mocked(SortableRow).mock.calls[0][0];
        expect(props.disabled).toBe(true);
    });

    it('passes disabled=true when hidden=true', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p' }, reordering: false, hidden: true });

        const props = jest.mocked(SortableRow).mock.calls[0][0];
        expect(props.disabled).toBe(true);
    });

    it('passes disabled=false when both reordering and hidden are false', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p' }, reordering: false, hidden: false });

        const props = jest.mocked(SortableRow).mock.calls[0][0];
        expect(props.disabled).toBe(false);
    });
});
