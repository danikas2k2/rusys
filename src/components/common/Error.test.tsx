import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Error } from '~/components/common/Error';

describe('<Error>', () => {
    it('renders with given children', () => {
        render(
            <MockTheme>
                <Error>Test Error</Error>
            </MockTheme>
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Test Error');
    });
});
