import { fireEvent, render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { SummaryYearBar } from '~/client/pages/summary/SummaryYearBar';
import { useSummary } from '~/client/state/summary/useSummary';

vi.mock(import('~/client/state/summary/useSummary'), () => ({ useSummary: vi.fn() }));
vi.mock(import('~/client/pages/summary/SummaryCell'), async () => ({
    ...(await vi.importActual('~/client/pages/summary/SummaryCell')),
    SummaryAmounts: ({ amounts, inline }: { amounts?: readonly { amount: number }[]; inline?: boolean }) =>
        amounts?.length ? <span data-inline={inline}>{amounts[0]!.amount}</span> : '.',
}));

describe('<SummaryYearBar>', () => {
    afterEach(() => vi.clearAllMocks());

    it('changes the active year, total and history context', () => {
        const setActive = vi.fn();
        vi.mocked(useSummary).mockReturnValue([
            {
                group: 'Uogienės',
                name: 'Avietės',
                years: [
                    { year: 23, amounts: [{ variant: 'p', amount: 5 }] },
                    { year: 22, amounts: [{ variant: 'p', amount: 3 }] },
                ],
            },
        ]);
        render(
            <MockThemeActive
                active={{
                    action: 'history',
                    data: { group: 'Uogienės', name: 'Avietės', year: 23, amounts: [{ variant: 'p', amount: 5 }] },
                }}
                setActive={setActive}
            >
                <SummaryYearBar />
            </MockThemeActive>
        );

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('5')).toHaveAttribute('data-inline', 'true');
        expect(screen.getByLabelText('23/24')).toBeChecked();

        fireEvent.click(screen.getByLabelText('22/23'));

        expect(setActive).toHaveBeenCalledWith({
            action: 'history',
            data: { group: 'Uogienės', name: 'Avietės', year: 22, amounts: [{ variant: 'p', amount: 3 }] },
        });
    });
});
