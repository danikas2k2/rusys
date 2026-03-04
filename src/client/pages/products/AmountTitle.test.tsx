import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { AmountTitle } from '~/client/pages/products/AmountTitle';

describe('<AmountTitle>', () => {
    it('renders name and group', () => {
        render(
            <MockTheme>
                <AmountTitle group="Uogienės" name="Braškės" />
            </MockTheme>
        );

        expect(screen.getByText(/Braškės/)).toBeInTheDocument();
        expect(screen.getByText(/Uogienės/)).toBeInTheDocument();
    });

    it('renders without year when year is 0', () => {
        render(
            <MockTheme>
                <AmountTitle group="Uogienės" name="Braškės" year={0} />
            </MockTheme>
        );

        expect(screen.getByText(/Uogienės/)).toBeInTheDocument();
        expect(screen.queryByText(/, 0/)).not.toBeInTheDocument();
    });

    it('renders year when year is provided', () => {
        render(
            <MockTheme>
                <AmountTitle group="Uogienės" name="Braškės" year={2024} />
            </MockTheme>
        );

        expect(screen.getByText(/Uogienės, 2024/)).toBeInTheDocument();
    });
});
