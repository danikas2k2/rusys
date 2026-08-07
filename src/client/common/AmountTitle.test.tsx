import { fireEvent, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { AmountTitle } from '~/client/common/AmountTitle';

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

    it('renders without year when year is not provided', () => {
        render(
            <MockTheme>
                <AmountTitle group="Uogienės" name="Braškės" />
            </MockTheme>
        );

        expect(screen.getByText(/Uogienės/)).toBeInTheDocument();
        expect(screen.queryByText(/, /)).not.toBeInTheDocument();
    });

    it('renders year when year is provided', () => {
        render(
            <MockTheme>
                <AmountTitle group="Uogienės" name="Braškės" year={2024} />
            </MockTheme>
        );

        expect(screen.getByText(/Uogienės, 2024/)).toBeInTheDocument();
    });

    it('renders an avatar when image is provided', () => {
        render(
            <MockTheme>
                <AmountTitle group="Uogienės" name="Braškės" image={{ url: '/images/ab/cd/product.png' }} />
            </MockTheme>
        );

        expect(document.querySelector('img')).toHaveAttribute('src', '/images/ab/cd/product.png');
    });

    it('does not render an avatar when image is not provided', () => {
        render(
            <MockTheme>
                <AmountTitle group="Uogienės" name="Braškės" />
            </MockTheme>
        );

        expect(document.querySelector('img')).not.toBeInTheDocument();
    });

    it('falls back to the first letter of the name when the image fails to load', () => {
        const { container } = render(
            <MockTheme>
                <AmountTitle group="Uogienės" name="Braškės" image={{ url: '/images/ab/cd/product.png' }} />
            </MockTheme>
        );

        fireEvent.error(container.querySelector('img')!);

        expect(screen.getByText('B')).toBeInTheDocument();
    });
});
