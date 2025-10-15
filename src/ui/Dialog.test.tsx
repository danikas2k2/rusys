import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { Dialog } from '@ui/Dialog';

describe('<Dialog>', () => {
    it('renders when open prop is true', () => {
        render(<Dialog open />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when open prop is false', () => {
        render(<Dialog open={false} />);

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders children', () => {
        render(
            <Dialog open>
                <div>test</div>
            </Dialog>
        );

        expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('calls onClose when clicked outside', async () => {
        const onClose = jest.fn();
        render(<Dialog open onClose={onClose} />);
        await userEvent.click(screen.getByRole('complementary', { name: 'backdrop' }));

        expect(onClose).toHaveBeenCalledWith(expect.event('click'));
    });

    it('does not call onClose when clicked inside', async () => {
        const onClose = jest.fn();
        render(<Dialog open onClose={onClose} />);
        await userEvent.click(screen.getByRole('dialog'));

        expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when escape key is pressed', async () => {
        const onClose = jest.fn();
        render(<Dialog open onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole('complementary', { name: 'backdrop' }), { key: 'Escape' });

        expect(onClose).toHaveBeenCalledWith();
    });

    it('does not call onClose when other key is pressed', async () => {
        const onClose = jest.fn();
        render(<Dialog open onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole('complementary', { name: 'backdrop' }), { key: 'a' });

        expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onOpen when open prop changes from false to true', () => {
        const onOpen = jest.fn();
        const { rerender } = render(<Dialog open={false} onOpen={onOpen} />);

        expect(onOpen).not.toHaveBeenCalled();

        rerender(<Dialog open onOpen={onOpen} />);

        expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('does not call onOpen when open prop changes from true to false', () => {
        const onOpen = jest.fn();
        const { rerender } = render(<Dialog open onOpen={onOpen} />);

        expect(onOpen).not.toHaveBeenCalled();

        rerender(<Dialog open={false} onOpen={onOpen} />);

        expect(onOpen).not.toHaveBeenCalled();
    });

    it('does not call onOpen when open prop remains true', () => {
        const onOpen = jest.fn();
        const { rerender } = render(<Dialog open onOpen={onOpen} />);

        expect(onOpen).not.toHaveBeenCalled();

        rerender(<Dialog open onOpen={onOpen} />);

        expect(onOpen).not.toHaveBeenCalled();
    });
});
