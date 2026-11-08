import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { AmountHistoryRow } from '~/features/products/AmountHistoryRow';
import { useMoveConsumedToRecycled } from '~/features/products/hooks/useMoveConsumedToRecycled';

vi.mock(import('~/features/products/hooks/useMoveConsumedToRecycled'));

describe('<AmountHistoryRow> table layout', () => {
    it('keeps the date with the first amount and lets each amount expand across the table', async () => {
        vi.mocked(useMoveConsumedToRecycled).mockReturnValue(vi.fn());
        render(
            <MockApp>
                <Table tabIndex={-1}>
                    <Table.Tbody>
                        <AmountHistoryRow
                            h={{
                                group: 'G',
                                name: 'N',
                                time: 1000,
                                year: 22,
                                amounts: [
                                    { variant: 'Alpha', amount: -2, recycled: false },
                                    { variant: 'Beta', amount: -3, recycled: false },
                                ],
                            }}
                        />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );
        const first = screen.getByRole('button', { name: /Alpha/ });
        const second = screen.getByRole('button', { name: /Beta/ });

        expect(first.closest('tr')?.querySelector('[data-history-date]')).toBeInTheDocument();

        await user.click(first);

        expect(screen.getByRole('button', { name: /Alpha/ }).closest('td')).toHaveAttribute('colspan', '2');
        expect(screen.getByRole('textbox', { name: 'Amount' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await user.click(second);

        expect(screen.getByRole('button', { name: /Beta/ }).closest('td')).toHaveAttribute('colspan', '2');
        expect(
            screen.getByRole('button', { name: /Alpha/ }).closest('tr')?.querySelector('[data-history-date]')
        ).toBeInTheDocument();
    });

    it('previews the remaining consumed quantity and restores it on cancellation', async () => {
        const move = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useMoveConsumedToRecycled).mockReturnValue(move);
        render(
            <MockApp>
                <Table tabIndex={-1}>
                    <Table.Tbody>
                        <AmountHistoryRow
                            h={{
                                group: 'G',
                                name: 'N',
                                time: 1000,
                                year: 22,
                                amounts: [{ variant: 'Alpha', amount: -2, recycled: false }],
                            }}
                        />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));

        expect(screen.getByRole('button', { name: /Alpha/ })).toHaveTextContent('−1');
        expect(screen.getByText(/Remaining after recycling/)).toHaveTextContent('Remaining after recycling: -1');

        await user.click(screen.getByRole('button', { name: 'Decrease' }));

        expect(screen.getByRole('button', { name: /Alpha/ })).toHaveTextContent('0');
        expect(screen.getByText(/Remaining after recycling/)).toHaveTextContent('Remaining after recycling: 0');
        expect(move).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.getByRole('button', { name: /Alpha/ })).toHaveTextContent('−2');

        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Recycle' }));

        expect(move).toHaveBeenCalledWith(expect.objectContaining({ variant: 'Alpha', amount: 1 }));
    });

    it('clamps the draft and preview when a refresh reduces the available quantity', async () => {
        const move = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useMoveConsumedToRecycled).mockReturnValue(move);
        const makeRow = (amount: number) => (
            <MockApp>
                <Table tabIndex={-1}>
                    <Table.Tbody>
                        <AmountHistoryRow
                            h={{
                                group: 'G',
                                name: 'N',
                                time: 1000,
                                year: 22,
                                amounts: [{ variant: 'Alpha', amount, recycled: false }],
                            }}
                        />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );
        const { rerender } = render(makeRow(-3));
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        rerender(makeRow(-1));

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-1');
        expect(screen.getByRole('button', { name: /Alpha/ })).toHaveTextContent('0');
        expect(screen.getByText(/Remaining after recycling/)).toHaveTextContent('Remaining after recycling: 0');

        await user.click(screen.getByRole('button', { name: 'Recycle' }));

        expect(move).toHaveBeenCalledWith(expect.objectContaining({ amount: 1 }));
    });
});
