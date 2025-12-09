import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ScreenError } from '~/client/common/ScreenError';

describe('<ScreenError>', () => {
    it('renders alert with children and data-error flag', () => {
        render(
            <MockTheme>
                <ScreenError>Test failure</ScreenError>
            </MockTheme>
        );

        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent('Test failure');
        expect(alert.closest('[data-error]')).toBeInTheDocument();
    });
});
