import { render, screen } from '@testing-library/react';

import React from 'react';

import { AppVersion } from './AppVersion';

jest.mock('package.json', () => ({
    version: '1.0.0',
}));

describe('<AppVersion>', () => {
    it('renders version from package.json', () => {
        render(<AppVersion />);

        expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });
});
