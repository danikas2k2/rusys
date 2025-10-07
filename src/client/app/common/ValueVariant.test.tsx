import { render, screen } from '@testing-library/react';

import React from 'react';

import { ValueVariant } from '~/client/app/common/ValueVariant';

describe('<ValueVariant>', () => {
    it('renders variant as is by default', () => {
        render(<ValueVariant variant="d" />);

        expect(screen.getByText('d')).toBeInTheDocument();
    });

    it('renders full variant parts', () => {
        render(<ValueVariant variant="500 ml" />);

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('ml')).toBeInTheDocument();
    });
});
