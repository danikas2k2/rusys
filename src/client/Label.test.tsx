import { render, screen } from '@testing-library/react';
import React from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import { Label } from '~/client/Label';

jest.mock('~/client/hooks/useLabel', () => ({
    useLabel: jest.fn(),
}));

describe('Label', () => {
    beforeAll(() => {
        (useLabel as jest.Mock).mockReturnValue('Test Label');
    });

    it('renders with given children', () => {
        render(<Label>Test Label</Label>);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('calls useLabel with correct arguments', () => {
        render(<Label locale="en">Test Label</Label>);
        expect(useLabel).toHaveBeenCalledWith('Test Label', 'en');
    });

    it('renders correctly when useLabel returns null', () => {
        (useLabel as jest.Mock).mockReturnValueOnce(null);
        render(<Label>Test Label</Label>);
        expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });
});
