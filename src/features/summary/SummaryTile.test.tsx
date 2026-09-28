import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { AnnotatedTotalAmounts } from '~/components/amounts/AnnotatedTotalAmounts';
import { SummaryTile } from '~/features/summary/SummaryTile';

vi.mock(import('~/components/amounts/AnnotatedTotalAmounts'), () => ({
    AnnotatedTotalAmounts: vi.fn(({ amounts }: { amounts: readonly { amount: number }[] }) => (
        <span>{amounts[0]!.amount}</span>
    )),
}));

describe('<SummaryTile>', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    it('renders the selected year total and opens its history', async () => {
        const setActive = vi.fn();
        render(
            <MockThemeActive setActive={setActive}>
                <SummaryTile
                    group="Uogienės"
                    name="Avietės"
                    year={23}
                    amounts={[
                        {
                            year: 23,
                            amounts: [
                                { variant: 'p', amount: 5, recycled: false },
                                { variant: 'd', amount: 2, recycled: true },
                            ],
                        },
                    ]}
                    image="/avietes.png"
                />
            </MockThemeActive>
        );

        expect(screen.getByText('Avietės')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(document.querySelector('[data-icon-bg]')).toHaveStyle({ backgroundImage: 'url(/avietes.png)' });
        expect(document.querySelector('[data-type="consumed"]')).toContainElement(screen.getByText('5'));
        expect(document.querySelector('[data-type="recycled"]')).toContainElement(screen.getByText('2'));
        expect(AnnotatedTotalAmounts).toHaveBeenNthCalledWith(
            1,
            { group: 'Uogienės', amounts: [{ variant: 'p', amount: 5, recycled: false }] },
            undefined
        );
        expect(AnnotatedTotalAmounts).toHaveBeenNthCalledWith(
            2,
            { group: 'Uogienės', amounts: [{ variant: 'd', amount: 2, recycled: true }] },
            undefined
        );

        await user.click(document.querySelector('[data-summary-tile]')!);

        expect(setActive).toHaveBeenCalledWith({
            action: 'history',
            data: {
                group: 'Uogienės',
                name: 'Avietės',
                year: 23,
                amounts: [
                    { variant: 'p', amount: 5, recycled: false },
                    { variant: 'd', amount: 2, recycled: true },
                ],
                image: '/avietes.png',
            },
        });
    });
});
