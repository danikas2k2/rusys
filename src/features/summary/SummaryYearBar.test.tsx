import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { SummaryYearBar } from '~/features/summary/SummaryYearBar';
import { useSummary } from '~/store/summary';

vi.mock(import('~/store/summary/useSummary'), () => ({ useSummary: vi.fn() }));
vi.mock(import('~/features/summary/SummaryAmounts'), async () => ({
    ...(await vi.importActual('~/features/summary/SummaryAmounts')),
    SummaryAmounts: ({ amounts, inline }: { amounts?: readonly { amount: number }[]; inline?: boolean }) =>
        amounts?.length ? <span data-inline={inline}>{amounts[0]!.amount}</span> : '.',
}));

describe('<SummaryYearBar>', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => vi.clearAllMocks());

    it('renders nothing without active history', () => {
        vi.mocked(useSummary).mockReturnValue([]);
        const { container } = render(
            <MockThemeActive active={undefined}>
                <SummaryYearBar />
            </MockThemeActive>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('shows the accounting period when only one year is available', () => {
        vi.mocked(useSummary).mockReturnValue([
            {
                group: 'Uogienės',
                name: 'Avietės',
                years: [{ year: 23, amounts: [{ variant: 'p', amount: 5 }] }],
            },
        ]);
        render(
            <MockThemeActive
                active={{
                    action: 'history',
                    data: { group: 'Uogienės', name: 'Avietės', year: 23, amounts: [{ variant: 'p', amount: 5 }] },
                }}
            >
                <SummaryYearBar />
            </MockThemeActive>
        );

        expect(screen.getByLabelText('23/24')).toBeChecked();
    });

    it('changes the active year, total and history context', async () => {
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

        await user.click(screen.getByLabelText('22/23'));

        expect(setActive).toHaveBeenCalledWith({
            action: 'history',
            data: { group: 'Uogienės', name: 'Avietės', year: 22, amounts: [{ variant: 'p', amount: 3 }] },
        });
    });

    it('uses an empty total if a cached summary year has no amounts', async () => {
        const setActive = vi.fn();
        vi.mocked(useSummary).mockReturnValue([
            {
                group: 'Uogienės',
                name: 'Avietės',
                years: [
                    { year: 23, amounts: [{ variant: 'p', amount: 5 }] },
                    { year: 22, amounts: undefined as never },
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

        await user.click(screen.getByLabelText('22/23'));

        expect(setActive).toHaveBeenCalledWith({
            action: 'history',
            data: { group: 'Uogienės', name: 'Avietės', year: 22, amounts: [] },
        });
    });
});
