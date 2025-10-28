import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { ActiveRemoveConfirmation } from '~/client/pages/common/ActiveRemoveConfirmation';

describe('<ActiveRemoveConfirmation>', () => {
    afterEach(() => jest.clearAllMocks());

    it('renders nothing when not in deleting mode', () => {
        render(
            <MockApp>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders modal when action is deleting and data exists', () => {
        render(
            <MockApp active={{ action: 'remove', data: { data: 'Test' } }}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Are you sure to remove?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('calls setActive() when cancel button is clicked', async () => {
        const mockSetActive = jest.fn();

        render(
            <MockApp active={{ action: 'remove', data: { data: 'Test' } }} setActive={mockSetActive}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(mockSetActive).toHaveBeenCalledWith();
    });

    it('calls onConfirm with data and setActive() when remove button is clicked', async () => {
        const mockSetActive = jest.fn();
        const mockOnConfirm = jest.fn();

        render(
            <MockApp active={{ action: 'remove', data: { data: 'Test' } }} setActive={mockSetActive}>
                <ActiveRemoveConfirmation onConfirm={mockOnConfirm} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(mockOnConfirm).toHaveBeenCalledWith({ data: 'Test' });
        expect(mockSetActive).toHaveBeenCalledWith();
    });

    it('closes modal on backdrop click', async () => {
        const mockSetActive = jest.fn();

        render(
            <MockApp active={{ action: 'remove', data: { data: 'Test' } }} setActive={mockSetActive}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        const overlay = screen.getByRole('complementary');

        expect(overlay).toBeInTheDocument();

        await user.click(overlay);

        expect(mockSetActive).toHaveBeenCalledWith();
    });
});
