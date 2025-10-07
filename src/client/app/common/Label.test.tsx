import { render, screen } from '@testing-library/react';

import React from 'react';

import { Label } from '~/client/app/common/Label';
import { useLabel } from '~/client/app/hooks/useLabel';

jest.mock('~/client/app/hooks/useLabel', () => ({
    useLabel: jest.fn(),
}));

describe('<Label>', () => {
    beforeAll(() => {
        jest.mocked(useLabel).mockReturnValue('Test Label');
    });

    it('renders with given children', () => {
        render(<Label>Test Label</Label>);

        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('calls useLabel with correct arguments', () => {
        render(<Label locale="en">Test Label</Label>);

        expect(useLabel).toHaveBeenCalledWith('Test Label', 'en');
    });
});
