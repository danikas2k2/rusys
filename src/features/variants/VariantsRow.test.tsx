import { fireEvent, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { SortableRow } from '~/components/table/SortableRow';
import { VariantsRow } from '~/features/variants/VariantsRow';
import { useVariant } from '~/store/variants/useVariant';

vi.mock(import('~/components/table/SortableRow'), () => ({
    SortableRow: vi.fn(({ children, onClick, onKeyDown, tabIndex }: any) => (
        <tr onClick={onClick} onKeyDown={onKeyDown} tabIndex={tabIndex}>
            {children}
        </tr>
    )),
}));

vi.mock(import('~/components/runtime/ActiveContentContext'), async () => ({
    ...(await vi.importActual('~/components/runtime/ActiveContentContext')),
    useSetActiveContent: vi.fn(),
}));

vi.mock(import('~/store/variants/useVariant'), () => ({
    useVariant: vi.fn().mockReturnValue(undefined),
}));

describe('<VariantsRow>', () => {
    const setActive = vi.fn();

    beforeEach(() => vi.mocked(useSetActiveContent).mockReturnValue(setActive));

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

    it('renders count and units when key was auto-derived from them', () => {
        vi.mocked(useVariant).mockReturnValue({
            group: 'Uogienės',
            variant: '500ml',
            order: 0,
            count: 500,
            units: 'ml',
        });

        renderRow({
            variant: { group: 'Uogienės', variant: '500ml', order: 0, count: 500, units: 'ml' },
            reordering: false,
        });

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText(/ml\./)).toBeInTheDocument();
        expect(screen.queryByText('500ml')).not.toBeInTheDocument();
    });

    it('renders custom key with count as dimmed sub-text when key was not auto-derived from count/units', () => {
        vi.mocked(useVariant).mockReturnValue({
            group: 'Uogienės',
            variant: 'Litriukas',
            order: 0,
            count: 500,
            units: 'ml',
        });

        renderRow({
            variant: { group: 'Uogienės', variant: 'Litriukas', order: 0, count: 500, units: 'ml' },
            reordering: false,
        });

        expect(screen.getByText('Litriukas')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();
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

    it('passes disabled=true when filtering disables dragging', () => {
        renderRow({
            variant: { group: 'Uogienės', variant: 'p', order: 0 },
            reordering: false,
            dragDisabled: true,
        });

        const props = vi.mocked(SortableRow).mock.calls[0][0];

        expect(props.disabled).toBe(true);
    });

    it('passes disabled=false when both reordering and hidden are false', () => {
        renderRow({ variant: { group: 'Uogienės', variant: 'p', order: 0 }, reordering: false, hidden: false });

        const props = vi.mocked(SortableRow).mock.calls[0][0];

        expect(props.disabled).toBe(false);
    });

    it('opens the edit dialog when the row is clicked', () => {
        const variant = { group: 'Uogienės', variant: 'p', order: 0 };
        renderRow({ variant, reordering: false });

        screen.getByRole('row').click();

        expect(setActive).toHaveBeenCalledWith({ action: 'update', data: variant });
    });

    it('opens the edit dialog with the Enter key', () => {
        const variant = { group: 'Uogienės', variant: 'p', order: 0 };
        renderRow({ variant, reordering: false });

        screen.getByRole('row').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        expect(setActive).toHaveBeenCalledWith({ action: 'update', data: variant });
    });

    it('ignores a drag handle and unrelated keys but opens with Space', () => {
        const variant = { group: 'Uogienės', variant: 'p', order: 0 };
        renderRow({ variant, reordering: false });
        const row = screen.getByRole('row');
        const handle = document.createElement('button');
        handle.dataset.dragHandle = '';
        row.append(handle);

        fireEvent.click(handle);
        fireEvent.keyDown(row, { key: 'Escape' });

        expect(setActive).not.toHaveBeenCalled();

        fireEvent.keyDown(row, { key: ' ' });

        expect(setActive).toHaveBeenCalledWith({ action: 'update', data: variant });
    });
});
