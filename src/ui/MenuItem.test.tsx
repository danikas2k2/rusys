import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuItem } from '@ui/MenuItem';

describe('<MenuItem>', () => {
    it('renders to the document', () => {
        render(<MenuItem />);

        expect(screen.getByRole('menuitem')).toBeInTheDocument();
    });

    it('renders with provided children', () => {
        render(<MenuItem>Content</MenuItem>);

        expect(screen.getByRole('menuitem')).toHaveTextContent('Content');
    });

    it('renders with provided className', () => {
        render(<MenuItem className="test-class" />);

        expect(screen.getByRole('menuitem')).toHaveClass('test-class');
    });

    it('renders with startDecorator when provided', () => {
        render(<MenuItem startDecorator={<div>Start</div>} />);

        expect(screen.getByText('Start')).toBeInTheDocument();
    });

    it('renders with endDecorator when provided', () => {
        render(<MenuItem endDecorator={<div>End</div>} />);

        expect(screen.getByText('End')).toBeInTheDocument();
    });

    it('calls onClick on item click', async () => {
        const onClick = jest.fn();
        render(<MenuItem onClick={onClick} />);
        await userEvent.click(screen.getByRole('menuitem'));

        expect(onClick).toHaveBeenCalledWith(expect.event('click'));
    });
});
