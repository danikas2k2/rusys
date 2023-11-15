import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ButtonWithConfirmation from '@ui/ButtonWithConfirmation';
import React from 'react';

describe('ButtonWithConfirmation', () => {
    const onClick = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders to the document', () => {
        render(<ButtonWithConfirmation />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with content', () => {
        render(<ButtonWithConfirmation>Content</ButtonWithConfirmation>);
        expect(screen.getByRole('button')).toHaveTextContent('Content');
    });

    it('renders with content function', () => {
        render(<ButtonWithConfirmation>{() => <div>Content</div>}</ButtonWithConfirmation>);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with provided className', () => {
        render(<ButtonWithConfirmation className="test-class" />);
        expect(screen.getByRole('button')).toHaveClass('test-class');
    });

    it('opens confirmation dialog when button is clicked', async () => {
        render(<ButtonWithConfirmation />);
        await userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('opens confirmation dialog when custom rendered button is clicked', async () => {
        render(
            <ButtonWithConfirmation>
                {({ onClick }) => <button onClick={onClick}>Content</button>}
            </ButtonWithConfirmation>
        );
        await userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not call onClick while confirmation dialog is open', async () => {
        render(<ButtonWithConfirmation onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(onClick).not.toHaveBeenCalled();
    });

    it('calls onClick when confirm button in dialog is clicked', async () => {
        render(<ButtonWithConfirmation onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(onClick).toHaveBeenCalled();
    });

    it('closes confirmation dialog when close button in dialog is clicked', async () => {
        render(<ButtonWithConfirmation onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(onClick).not.toHaveBeenCalled();
    });

    it('closes confirmation dialog when cancel button in dialog is clicked', async () => {
        render(<ButtonWithConfirmation onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(onClick).not.toHaveBeenCalled();
    });
});
