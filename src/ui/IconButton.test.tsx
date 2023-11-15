import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconButton from '@ui/IconButton';
import React from 'react';

describe('IconButton', () => {
    it('renders to the document', () => {
        render(<IconButton />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with content', () => {
        render(<IconButton>Content</IconButton>);
        expect(screen.getByRole('button')).toHaveTextContent('Content');
    });

    it('renders with custom size', () => {
        render(<IconButton size="small" />);
        expect(screen.getByRole('button')).toHaveClass('size-small');
    });

    it('renders with custom variant', () => {
        render(<IconButton variant="solid" />);
        expect(screen.getByRole('button')).toHaveClass('variant-solid');
    });

    it('renders with custom spacing', () => {
        render(<IconButton spacing="medium" />);
        expect(screen.getByRole('button')).toHaveClass('spacing-medium');
    });

    it('calls onClick when clicked', async () => {
        const onClick = jest.fn();
        render(<IconButton onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });

    it('does not call onClick when disabled', async () => {
        const onClick = jest.fn();
        render(<IconButton onClick={onClick} disabled />);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).not.toHaveBeenCalled();
    });
});
