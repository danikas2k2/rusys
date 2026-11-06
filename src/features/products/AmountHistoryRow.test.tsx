import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { AmountHistoryRow } from '~/features/products/AmountHistoryRow';
import { useMoveConsumedToRecycled } from '~/features/products/hooks/useMoveConsumedToRecycled';
import type { History } from '~/schema';

vi.mock(import('~/features/products/hooks/useMoveConsumedToRecycled'));

vi.mock(import('~/components/amounts/AmountsCell'), (): any => ({
    AmountsCell: vi.fn(({ amounts }: any) => <span aria-label="Amount count">{amounts.length}</span>),
}));

vi.mock(import('~/features/products/MoveConsumedForm'), (): any => ({
    MoveConsumedForm: vi.fn(({ lines, onMove, disabled }: any) => (
        <div>
            <span aria-label="History line count">{lines.length}</span>
            <button type="button" disabled={disabled} onClick={() => onMove(lines[0], 1)}>
                move
            </button>
        </div>
    )),
}));

describe('<AmountHistoryRow>', () => {
    const moveConsumedToRecycled = vi.fn().mockResolvedValue(undefined);
    const onMoved = vi.fn();

    beforeEach(() => {
        vi.mocked(useMoveConsumedToRecycled).mockReturnValue(moveConsumedToRecycled);
    });

    afterEach(() => vi.clearAllMocks());

    function renderRow(h: History, dimmed = false) {
        return render(
            <MockApp>
                <Table tabIndex={-1}>
                    <Table.Tbody>
                        <AmountHistoryRow h={h} dimmed={dimmed} onMoved={onMoved} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );
    }

    it('treats a missing amounts field as empty instead of crashing', () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
        });

        expect(screen.getByLabelText('Amount count')).toHaveTextContent('0');
        expect(screen.queryByLabelText('History line count')).not.toBeInTheDocument();
    });

    it('does not expand when the entry has no consumed lines', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'p', amount: 2 }],
        });

        await user.click(screen.getAllByRole('row')[0]);

        expect(screen.queryByText('move')).not.toBeInTheDocument();
    });

    it('does not expand a dimmed row even when it has consumed lines', async () => {
        renderRow(
            {
                group: 'Daržovės',
                name: 'Morkos',
                time: 1000,
                year: 22,
                amounts: [{ variant: 'd', amount: -3, recycled: false }],
            },
            true
        );

        await user.click(screen.getAllByRole('row')[0]);

        expect(screen.queryByText('move')).not.toBeInTheDocument();
    });

    it('expands the move form, passing only the consumed lines, when clicked', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
            year: 22,
            amounts: [
                { variant: 'd', amount: -3, recycled: false },
                { variant: 'p', amount: 2 },
                { variant: 'm', amount: -1, recycled: true },
            ],
        });

        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));

        expect(screen.getByLabelText('History line count')).toHaveTextContent('1');
    });

    it('collapses the form when the row is clicked again', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });

        const row = screen.getByRole('button', { name: 'Move to discarded' });
        await user.click(row);

        expect(screen.getByText('move')).toBeInTheDocument();

        await user.click(row);

        expect(screen.queryByText('move')).not.toBeInTheDocument();
    });

    it('opens and closes the form with the keyboard and reports a failed move', async () => {
        renderRow({
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -2, recycled: false }],
        });
        const button = screen.getByRole('button', { name: 'Move to discarded' });
        button.focus();
        await user.keyboard('{Enter}');

        expect(button).toHaveAttribute('aria-expanded', 'true');

        moveConsumedToRecycled.mockRejectedValueOnce(new Error('stale'));
        await user.click(screen.getByText('move'));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Something went wrong');
        expect(screen.getByText('move')).toBeInTheDocument();

        button.focus();
        await user.keyboard(' ');

        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('calls moveConsumedToRecycled with the entry identity and collapses on success', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
            year: 22,
            user: 'author@example.com',
            amounts: [{ variant: 'd', amount: -3, recycled: false, home: true }],
        });

        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));
        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith({
            sourceSessionId: 'author@example.com:1000',
            group: 'Daržovės',
            name: 'Morkos',
            year: 22,
            variant: 'd',
            amount: 1,
            flags: {
                suspicious: undefined,
                home: true,
                expiresAt: undefined,
            },
        });
        expect(onMoved).toHaveBeenCalledWith();
        expect(screen.queryByText('move')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toHaveFocus();
    });

    it('passes the line expiresAt through to moveConsumedToRecycled', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
            year: 22,
            user: 'author@example.com',
            amounts: [{ variant: 'd', amount: -3, recycled: false, expiresAt: 1_700_000_000_000 }],
        });

        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));
        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith({
            sourceSessionId: 'author@example.com:1000',
            group: 'Daržovės',
            name: 'Morkos',
            year: 22,
            variant: 'd',
            amount: 1,
            flags: {
                suspicious: undefined,
                home: undefined,
                expiresAt: 1_700_000_000_000,
            },
        });
    });

    it('does not pass the original entry author when correcting history', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
            year: 22,
            user: 'original-author@example.com',
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });

        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));
        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith({
            sourceSessionId: 'original-author@example.com:1000',
            group: 'Daržovės',
            name: 'Morkos',
            year: 22,
            variant: 'd',
            amount: 1,
            flags: {
                suspicious: undefined,
                home: undefined,
                expiresAt: undefined,
            },
        });
    });

    it('defaults year to 0 when the history entry has no year', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });

        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));
        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith({
            sourceSessionId: ':1000',
            group: 'Daržovės',
            name: 'Morkos',
            year: 0,
            variant: 'd',
            amount: 1,
            flags: {
                suspicious: undefined,
                home: undefined,
                expiresAt: undefined,
            },
        });
    });
});
