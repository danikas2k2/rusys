import { render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { AmountHistoryRow } from '~/features/products/AmountHistoryRow';
import { RecycleRefreshError } from '~/features/products/hooks/RecycleRefreshError';
import { useMoveConsumedToRecycled } from '~/features/products/hooks/useMoveConsumedToRecycled';
import type { History } from '~/schema';

vi.mock(import('~/features/products/hooks/useMoveConsumedToRecycled'));

vi.mock(import('~/components/amounts/AmountsCell'), (): any => ({
    AmountsCell: vi.fn(({ amounts, onSelect, isExpanded, renderDetails, renderRow, disabled }: any) => (
        <>
            {!amounts.length && <span aria-label="Amount count">0</span>}
            {amounts.map((line: any, index: number) => (
                <React.Fragment key={index}>
                    {renderRow(
                        <div data-testid={`line-${line.variant}`} data-history-amount-line>
                            {onSelect && line.recycled === false && line.amount < 0 && (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    data-history-key={String(index)}
                                    aria-expanded={isExpanded(line, String(index))}
                                    onClick={(event) => onSelect(line, event.currentTarget, String(index))}
                                >
                                    Move to discarded: {line.variant}
                                </button>
                            )}
                            {renderDetails?.(line, String(index))}
                        </div>,
                        index,
                        isExpanded(line, String(index)),
                        index === amounts.length - 1
                    )}
                </React.Fragment>
            ))}
        </>
    )),
}));

vi.mock(import('~/features/products/MoveConsumedForm'), (): any => ({
    MoveConsumedForm: vi.fn(({ lines, onMove, onCancel, disabled }: any) => (
        <div>
            <span aria-label="History line count">{lines.length}</span>
            <input aria-label="Amount" disabled={disabled} />
            <button type="button" onClick={onCancel}>
                Cancel
            </button>
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

    it('reports a committed transfer with a failed refresh in a standalone row', async () => {
        moveConsumedToRecycled.mockRejectedValueOnce(new RecycleRefreshError());
        renderRow({
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -2, recycled: false }],
        });
        await user.click(screen.getByRole('button', { name: 'Move to discarded: d' }));
        await user.click(screen.getByRole('button', { name: 'move' }));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Recycled, but refresh failed');
        expect(screen.getByRole('button', { name: 'Move to discarded: d' })).toBeDisabled();
    });

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

        const button = screen.getByRole('button', { name: /Move to discarded/ });

        expect(button.closest('[data-history-amounts]')).toBeInTheDocument();

        await user.click(button);

        expect(screen.getByLabelText('History line count')).toHaveTextContent('1');
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getAllByRole('row')).toHaveLength(4);
    });

    it('collapses the form when the row is clicked again', async () => {
        renderRow({
            group: 'Daržovės',
            name: 'Morkos',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });

        const row = screen.getByRole('button', { name: /Move to discarded/ });
        await user.click(row);

        expect(screen.getByText('move')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Cancel/ }));

        expect(screen.queryByText('move')).not.toBeInTheDocument();
    });

    it('collapses the selected variant when its button is clicked again', async () => {
        renderRow({
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });
        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));
        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));

        expect(screen.queryByLabelText('History line count')).not.toBeInTheDocument();
    });

    it('announces saving and restores focus to the input after a failed transfer', async () => {
        let rejectMove: (reason: Error) => void = () => undefined;
        moveConsumedToRecycled.mockImplementationOnce(
            () =>
                new Promise((_, reject) => {
                    rejectMove = reject;
                })
        );
        renderRow({
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -3, recycled: false }],
        });
        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));
        await user.click(screen.getByText('move'));

        expect(screen.getByRole('status')).toHaveFocus();
        expect(screen.getByRole('status')).toHaveTextContent('Update');

        rejectMove(new Error('stale'));
        await screen.findByRole('alert');

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveFocus();
    });

    it('opens the selected consumed variant inside its own row', async () => {
        renderRow({
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [
                { variant: 'd', amount: -3, recycled: false },
                { variant: 'p', amount: -1, recycled: false },
                { variant: 'm', amount: -1, recycled: true },
            ],
        });

        expect(screen.getAllByRole('button', { name: /Move to discarded/ })).toHaveLength(2);
        expect(screen.getByRole('button', { name: 'Move to discarded: p' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Move to discarded: d' })).toBeInTheDocument();

        await user.click(within(screen.getByTestId('line-p')).getByRole('button', { name: /Move to discarded/ }));

        expect(within(screen.getByTestId('line-p')).getByText('move')).toBeInTheDocument();
        expect(within(screen.getByTestId('line-d')).queryByText('move')).not.toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(3);

        await user.click(screen.getByText('move'));

        expect(moveConsumedToRecycled).toHaveBeenCalledWith(expect.objectContaining({ variant: 'p', amount: 1 }));
    });

    it('places the date with the first amount and expands either amount across both columns', async () => {
        renderRow({
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [
                { variant: 'd', amount: -3, recycled: false },
                { variant: 'p', amount: -1, recycled: false },
            ],
        });
        const first = screen.getByRole('button', { name: 'Move to discarded: d' });
        const second = screen.getByRole('button', { name: 'Move to discarded: p' });
        const date = document.querySelector('[data-history-date]');

        expect(first.closest('tr')).toContainElement(date);
        expect(second.closest('tr')).not.toContainElement(date);

        await user.click(first);

        const expandedFirst = screen.getByRole('button', { name: 'Move to discarded: d' });
        const expandedDate = document.querySelector('[data-history-date]');

        expect(expandedFirst.closest('td')).toHaveAttribute('colspan', '2');
        expect(expandedFirst.closest('tr')).not.toContainElement(expandedDate);
        expect(expandedDate?.closest('tr')?.nextElementSibling).toBe(expandedFirst.closest('tr'));

        await user.click(expandedFirst);
        await user.click(screen.getByRole('button', { name: 'Move to discarded: p' }));

        expect(screen.getByRole('button', { name: 'Move to discarded: d' }).closest('tr')).toContainElement(
            document.querySelector('[data-history-date]')
        );
        expect(screen.getByRole('button', { name: 'Move to discarded: p' }).closest('td')).toHaveAttribute(
            'colspan',
            '2'
        );
        expect(
            screen.getByRole('button', { name: 'Move to discarded: p' }).closest('td')?.querySelector('time')
        ).toBeInTheDocument();
    });

    it('restores focus to the selected session when another session has the same variant', async () => {
        const entry: History = {
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -1, recycled: false }],
        };
        render(
            <MockApp>
                <Table tabIndex={-1}>
                    <Table.Tbody>
                        <AmountHistoryRow h={entry} />
                        <AmountHistoryRow h={{ ...entry, time: 2000 }} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );
        await user.click(screen.getAllByRole('button', { name: 'Move to discarded: d' })[1]);

        expect(screen.getAllByRole('button', { name: 'Move to discarded: d' })[1]).toHaveFocus();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.getAllByRole('button', { name: 'Move to discarded: d' })[1]).toHaveFocus();
    });

    it('keeps the selected form open when history refreshes with new objects', async () => {
        const entry: History = {
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -3, recycled: false, home: true }],
        };
        const { rerender } = renderRow(entry);
        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));
        rerender(
            <MockApp>
                <Table tabIndex={-1}>
                    <Table.Tbody>
                        <AmountHistoryRow
                            h={{ ...entry, amounts: entry.amounts!.map((line) => ({ ...line })) }}
                            onMoved={onMoved}
                        />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
        expect(screen.getByText('move')).toBeInTheDocument();
    });

    it('does not expand a recycled line with the same variant as the selected consumed line', async () => {
        renderRow({
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [
                { variant: 'd', amount: -3, recycled: false },
                { variant: 'd', amount: -1, recycled: true },
            ],
        });
        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));

        expect(screen.getAllByText('move')).toHaveLength(1);
    });

    it('opens and closes the form with the keyboard and reports a failed move', async () => {
        renderRow({
            group: 'G',
            name: 'N',
            time: 1000,
            year: 22,
            amounts: [{ variant: 'd', amount: -2, recycled: false }],
        });
        const button = screen.getByRole('button', { name: /Move to discarded/ });
        button.focus();
        await user.keyboard('{Enter}');

        expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-expanded', 'true');

        moveConsumedToRecycled.mockRejectedValueOnce(new Error('stale'));
        await user.click(screen.getByText('move'));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Something went wrong');
        expect(screen.getByText('move')).toBeInTheDocument();

        screen.getByRole('button', { name: /Cancel/ }).focus();
        await user.keyboard(' ');

        expect(button).toHaveAttribute('aria-expanded', 'false');

        await waitFor(() => expect(button).toHaveFocus());
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

        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));
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

        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));
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

        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));
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

        await user.click(screen.getByRole('button', { name: /Move to discarded/ }));
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
