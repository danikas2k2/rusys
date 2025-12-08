import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ScreenLoader } from '~/client/common/ScreenLoader';

describe('<ScreenLoader>', () => {
    it('renders loader container with data-loading flag', () => {
        render(
            <MockTheme>
                <ScreenLoader />
            </MockTheme>
        );

        const loader = screen.getByRole('progressbar');

        expect(loader).toBeInTheDocument();
        expect(loader.closest('[data-loading]')).toBeInTheDocument();
    });
});
