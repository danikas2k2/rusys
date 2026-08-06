import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { AmountHistoryRow } from '~/client/pages/products/AmountHistoryRow';
import { useMoveConsumedToRecycled } from '~/client/state/products/useMoveConsumedToRecycled';
import type { History } from '~/types/data';

vi.mock(import('~/client/state/products/useMoveConsumedToRecycled'));

vi.mock(import('~/client/pages/products/AmountsCell'), (): any => ({
    AmountsCell: vi.fn(({ amounts }: any) => <span data-testid="amounts">{amounts.length}</span>),
}));

vi.mock(import('~/client/pages/products/MoveConsumedForm'), (): any => ({
    MoveConsumedForm: vi.fn(({ lines, onMove, disabled }: any) => (
        <div>
            <span data-testid="lines-count">{lines.length}</span>
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
                <Table>
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
            name: 'Agurkai',
            time: 1000,
        });

        expect(screen.getByTestId('amounts')).toHaveTextContent('0');
        expect(screen.queryByTestId('lines-count')).not.toBeInTheDocument();
    });

    it('does not expand when the entry has no consumed lines', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Agurkai',
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
                name: 'Agurkai',
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
            name: 'Agurkai',
            time: 1000,
            year: 22,
            amounts: [
                { variant: 'd', amount: -3, recycled: false },
                { variant: 'p', amount: 2 },
                { variant: 'm', amount: -1, recycled: true },
            ],
        });

        await user.click(screen.getAllByRole('row')[0]);

        expect(screen.getByTestId('lines-count')).toHaveTextContent('1');
    });

    it('collapses the form when the row is clicked again', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Agurkai',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });

        const row = screen.getAllByRole('row')[0];
        await user.click(row);

        expect(screen.getByText('move')).toBeInTheDocument();

        await user.click(row);

        expect(screen.queryByText('move')).not.toBeInTheDocument();
    });

    it('calls moveConsumedToRecycled with the entry identity and its own author, and collapses on success', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Agurkai',
            time: 1000,
            year: 22,
            user: 'author@example.com',
            amounts: [{ variant: 'd', amount: -3, recycled: false, home: true }],
        });

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            22,
            1000,
            'd',
            1,
            { suspicious: undefined, home: true },
            'author@example.com'
        );
        expect(onMoved).toHaveBeenCalledWith();
        expect(screen.queryByText('move')).not.toBeInTheDocument();
    });

    it('passes the line expiresAt through to moveConsumedToRecycled', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Agurkai',
            time: 1000,
            year: 22,
            user: 'author@example.com',
            amounts: [{ variant: 'd', amount: -3, recycled: false, expiresAt: 1_700_000_000_000 }],
        });

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            22,
            1000,
            'd',
            1,
            { suspicious: undefined, home: undefined, expiresAt: 1_700_000_000_000 },
            'author@example.com'
        );
    });

    it('passes the entry author even when it differs from whoever is performing the correction', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Agurkai',
            time: 1000,
            year: 22,
            user: 'original-author@example.com',
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            22,
            1000,
            'd',
            1,
            { suspicious: undefined, home: undefined },
            'original-author@example.com'
        );
    });

    it('defaults year to 0 when the history entry has no year', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Agurkai',
            time: 1000,
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            0,
            1000,
            'd',
            1,
            { suspicious: undefined, home: undefined },
            undefined
        );
    });
});
