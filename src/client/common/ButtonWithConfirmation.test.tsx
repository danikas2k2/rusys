import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { Button, IconButton } from '@ui/Button';

import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { Label } from '~/client/common/Label';

jest.mock('~/client/common/Label');

describe('<ButtonWithConfirmation>', () => {
    const mockClick = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders to the document', () => {
        render(<ButtonWithConfirmation />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with provided className', () => {
        render(<ButtonWithConfirmation className="test-class" />);

        expect(screen.getByRole('button')).toHaveClass('test-class');
    });

    it('renders with content', () => {
        render(<ButtonWithConfirmation>Content</ButtonWithConfirmation>);

        expect(screen.getByRole('button')).toHaveTextContent('Content');
    });

    it('renders with content element', () => {
        render(
            <ButtonWithConfirmation>
                <div>Content</div>
            </ButtonWithConfirmation>
        );

        expect(screen.getByRole('button', { name: 'Content' })).toBeInTheDocument();
    });

    it('renders with Label element', () => {
        render(
            <ButtonWithConfirmation>
                <Label>Content</Label>
            </ButtonWithConfirmation>
        );

        expect(screen.getByRole('button', { name: 'Content' })).toBeInTheDocument();
    });

    it('renders with Button element', () => {
        render(
            <ButtonWithConfirmation>
                <Button>Content</Button>
            </ButtonWithConfirmation>
        );

        expect(screen.getByRole('button', { name: 'Content' })).toBeInTheDocument();
    });

    it('renders with IconButton element', () => {
        render(
            <ButtonWithConfirmation>
                <IconButton>Content</IconButton>
            </ButtonWithConfirmation>
        );

        expect(screen.getByRole('button', { name: 'Content' })).toBeInTheDocument();
    });

    it('opens confirmation dialog when button is clicked', async () => {
        render(<ButtonWithConfirmation />);
        await userEvent.click(screen.getByRole('button', { name: '' }));

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not call onClick while confirmation dialog is open', async () => {
        render(<ButtonWithConfirmation onClick={mockClick} />);
        await userEvent.click(screen.getByRole('button', { name: '' }));

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(mockClick).not.toHaveBeenCalled();
    });

    it('calls onClick when confirm button in dialog is clicked', async () => {
        render(<ButtonWithConfirmation onClick={mockClick} />);
        await userEvent.click(screen.getByRole('button', { name: '' }));
        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(mockClick).toHaveBeenCalledWith(expect.event('click'));
    });

    it('closes confirmation dialog when close button in dialog is clicked', async () => {
        render(<ButtonWithConfirmation onClick={mockClick} />);
        await userEvent.click(screen.getByRole('button', { name: '' }));
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(mockClick).not.toHaveBeenCalled();
    });

    it('closes confirmation dialog when cancel button in dialog is clicked', async () => {
        render(<ButtonWithConfirmation onClick={mockClick} />);
        await userEvent.click(screen.getByRole('button', { name: '' }));
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(mockClick).not.toHaveBeenCalled();
    });

    it('renders with content passed to confirm button', async () => {
        render(<ButtonWithConfirmation>Content</ButtonWithConfirmation>);
        await userEvent.click(screen.getByRole('button', { name: 'Content' }));

        expect(screen.getAllByRole('button', { name: 'Content' })).toHaveLength(2);
    });

    it('renders with content element passed to confirm button', async () => {
        render(
            <ButtonWithConfirmation>
                <div>Content</div>
            </ButtonWithConfirmation>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Content' }));

        expect(screen.getAllByRole('button', { name: 'Content' })).toHaveLength(2);
    });

    it('renders with Label element passed to confirm button', async () => {
        render(
            <ButtonWithConfirmation>
                <Label>Content</Label>
            </ButtonWithConfirmation>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Content' }));

        expect(screen.getAllByRole('button', { name: 'Content' })).toHaveLength(2);
    });

    it('renders with Button element passed to confirm button', async () => {
        render(
            <ButtonWithConfirmation>
                <Button>Content</Button>
            </ButtonWithConfirmation>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Content' }));

        expect(screen.getAllByRole('button', { name: 'Content' })).toHaveLength(2);
    });

    it('renders with IconButton element passed to confirm button', async () => {
        render(
            <ButtonWithConfirmation>
                <IconButton>Content</IconButton>
            </ButtonWithConfirmation>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Content' }));

        expect(screen.getAllByRole('button', { name: 'Content' })).toHaveLength(2);
    });

    it('renders with button element passed to confirm button when button content is re-wrapped with Button', async () => {
        render(
            <ButtonWithConfirmation>
                <button>Content</button>
            </ButtonWithConfirmation>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Content' }));

        expect(screen.getAllByRole('button', { name: 'Content' })).toHaveLength(2);
    });
});
