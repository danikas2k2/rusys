import React from 'react';
import { render, screen } from '@testing-library/react';
import { MenuDivider } from '@ui/MenuDivider';

describe('<MenuDivider>', () => {
    it('renders with role separator', () => {
        render(<MenuDivider />);

        expect(screen.getByRole('separator')).toBeInTheDocument();
    });
});
