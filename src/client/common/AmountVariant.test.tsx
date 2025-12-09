import { render, screen } from '@testing-library/react';

import React from 'react';

import { AmountVariant } from '~/client/common/AmountVariant';

describe('<AmountVariant>', () => {
    it('renders variant as is by default', () => {
        render(<AmountVariant variant="d" />);

        expect(screen.getByText('d')).toBeInTheDocument();
    });

    it('renders full variant parts', () => {
        render(<AmountVariant variant="500 ml" />);

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('ml')).toBeInTheDocument();
    });
});
