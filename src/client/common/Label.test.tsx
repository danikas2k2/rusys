import { render, screen } from '@testing-library/react';

import React from 'react';

import { Label } from '~/client/common/Label';
import { useLabel } from '~/client/hooks/useLabel';

vi.mock(import('~/client/hooks/useLabel'), () => ({
    useLabel: vi.fn(),
}));

describe('<Label>', () => {
    beforeAll(() => {
        vi.mocked(useLabel).mockReturnValue('Test Label');
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
