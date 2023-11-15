import { render, screen } from '@testing-library/react';
import MenuDivider from '@ui/MenuDivider';
import React from 'react';

describe('MenuDivider', () => {
    it('renders with role separator', () => {
        render(<MenuDivider />);
        expect(screen.getByRole('separator')).toBeInTheDocument();
    });
});
