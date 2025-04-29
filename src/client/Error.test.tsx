import React from 'react';
import { render, screen } from '@testing-library/react';
import { Error } from '~/client/Error';

describe('<Error>', () => {
    it('renders with given children', () => {
        render(<Error>Test Error</Error>);

        expect(screen.getByRole('alert')).toHaveTextContent('Test Error');
    });
});
