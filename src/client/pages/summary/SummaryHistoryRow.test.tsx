import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { AmountsCell } from '~/client/common/AmountsCell';
import { SummaryHistoryRow } from '~/client/pages/summary/SummaryHistoryRow';

vi.mock(import('~/client/common/AmountsCell'), () => ({ AmountsCell: vi.fn(() => <span>Amounts</span>) }));
vi.mock(import('~/client/common/EmailAvatar'), () => ({
    EmailAvatar: vi.fn(({ email }: { email?: string }) => <span>{email}</span>),
}));
vi.mock(import('~/client/common/FormatDate'), () => ({ FormatDate: vi.fn(() => <time>Today</time>) }));

describe('<SummaryHistoryRow>', () => {
    it('renders history metadata and passes the group to the shared amounts cell', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SummaryHistoryRow
                            h={{
                                group: 'Uogienės',
                                name: 'Avietės',
                                time: Date.now(),
                                user: 'user@example.com',
                                comment: 'Pastaba',
                                amounts: [{ variant: 'p', amount: 2 }],
                            }}
                        />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(screen.getByText('user@example.com')).toBeInTheDocument();
        expect(screen.getByText('Pastaba')).toBeInTheDocument();
        expect(screen.getByText('Amounts')).toBeInTheDocument();
        expect(AmountsCell).toHaveBeenCalledWith(
            expect.objectContaining({ group: 'Uogienės', amounts: [{ variant: 'p', amount: 2 }] }),
            undefined
        );
    });

    it('dims reversed history entries', () => {
        const { container } = render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SummaryHistoryRow dimmed h={{ group: 'Uogienės', name: 'Avietės', time: Date.now() }} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(container.querySelector('tr')).toHaveStyle({ opacity: '0.4' });
    });
});
