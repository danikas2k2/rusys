import { fireEvent, render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { AnnotatedTotalAmounts } from '~/client/common/AnnotatedTotalAmounts';
import { SummaryTile } from '~/client/pages/summary/SummaryTile';

vi.mock(import('~/client/common/AnnotatedTotalAmounts'), () => ({
    AnnotatedTotalAmounts: vi.fn(({ amounts }: { amounts: readonly { amount: number }[] }) => (
        <span>{amounts[0]!.amount}</span>
    )),
}));

describe('<SummaryTile>', () => {
    it('renders the selected year total and opens its history', () => {
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

        fireEvent.click(document.querySelector('[data-summary-tile]')!);

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
