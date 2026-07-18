import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';
import React from 'react';
import { AmountsCell } from '~/client/pages/products/AmountsCell';
import type { VariantAmount } from '~/types/data';

describe('<AmountsCell>', () => {
    it('renders an em dash when amounts array is empty', () => {
        render(
            <MockTheme>
                <AmountsCell amounts={[]} />
            </MockTheme>
        );

        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders variant name and positive amount as +N', () => {
        const amounts: VariantAmount[] = [{ variant: 'Alpha', amount: 5, recycled: false }];

        render(
            <MockTheme>
                <AmountsCell amounts={amounts} />
            </MockTheme>
        );

        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('+5')).toBeInTheDocument();
    });

    it('renders variant name and negative amount as −N (minus sign, not hyphen)', () => {
        const amounts: VariantAmount[] = [{ variant: 'Beta', amount: -3, recycled: false }];

        render(
            <MockTheme>
                <AmountsCell amounts={amounts} />
            </MockTheme>
        );

        expect(screen.getByText('Beta')).toBeInTheDocument();
        // U+2212 MINUS SIGN, not a hyphen
        expect(screen.getByText('−3')).toBeInTheDocument();
    });

    it('renders 0 for a zero amount', () => {
        const amounts: VariantAmount[] = [{ variant: 'Gamma', amount: 0, recycled: false }];

        render(
            <MockTheme>
                <AmountsCell amounts={amounts} />
            </MockTheme>
        );

        expect(screen.getByText('Gamma')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('sorts rows alphabetically by variant name', () => {
        const amounts: VariantAmount[] = [
            { variant: 'Zucchini', amount: 1, recycled: false },
            { variant: 'Apple', amount: 2, recycled: false },
            { variant: 'Mango', amount: 3, recycled: false },
        ];

        render(
            <MockTheme>
                <AmountsCell amounts={amounts} />
            </MockTheme>
        );

        const names = screen.getAllByText(/Apple|Mango|Zucchini/).map((el) => el.textContent);
        expect(names).toEqual(['Apple', 'Mango', 'Zucchini']);
    });

    it('renders aria-label "Consumed" for recycled: false', () => {
        const amounts: VariantAmount[] = [{ variant: 'Delta', amount: 1, recycled: false }];

        render(
            <MockTheme>
                <AmountsCell amounts={amounts} />
            </MockTheme>
        );

        expect(screen.getByLabelText('Consumed')).toBeInTheDocument();
    });

    it('renders aria-label "Recycled" for recycled: true', () => {
        const amounts: VariantAmount[] = [{ variant: 'Epsilon', amount: 1, recycled: true }];

        render(
            <MockTheme>
                <AmountsCell amounts={amounts} />
            </MockTheme>
        );

        expect(screen.getByLabelText('Recycled')).toBeInTheDocument();
    });

    it('renders aria-label "Updated" when recycled is undefined', () => {
        const amounts: VariantAmount[] = [{ variant: 'Zeta', amount: 1 }];

        render(
            <MockTheme>
                <AmountsCell amounts={amounts} />
            </MockTheme>
        );

        expect(screen.getByLabelText('Updated')).toBeInTheDocument();
    });
});
