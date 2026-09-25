import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { ActiveRemoveConfirmation } from '~/features/common/ActiveRemoveConfirmation';

describe('<ActiveRemoveConfirmation>', () => {
    afterEach(() => vi.clearAllMocks());

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
        const mockSetActive = vi.fn();

        render(
            <MockApp active={{ action: 'remove', data: { data: 'Test' } }} setActive={mockSetActive}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(mockSetActive).toHaveBeenCalledWith();
    });

    it('calls onConfirm with data and setActive() when remove button is clicked', async () => {
        const mockSetActive = vi.fn();
        const mockOnConfirm = vi.fn();

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
        const mockSetActive = vi.fn();

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

    it('does not render modal when action is not remove', () => {
        render(
            <MockApp active={{ action: 'update', data: { data: 'Test' } }}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render modal when action is not remove but data exists', () => {
        render(
            <MockApp active={{ action: 'values', data: { data: 'Test' } }}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render modal when data is missing', () => {
        render(
            <MockApp active={{ action: 'remove' }}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls setActive when remove button is clicked without onConfirm', async () => {
        const mockSetActive = vi.fn();

        render(
            <MockApp active={{ action: 'remove', data: { data: 'Test' } }} setActive={mockSetActive}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(mockSetActive).toHaveBeenCalledWith();
    });

    it('calls setActive when remove button is clicked with onConfirm but no data', async () => {
        const mockSetActive = vi.fn();
        const mockOnConfirm = vi.fn();

        render(
            <MockApp active={{ action: 'remove' }} setActive={mockSetActive}>
                <ActiveRemoveConfirmation onConfirm={mockOnConfirm} />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render modal when data is undefined', () => {
        render(
            <MockApp active={{ action: 'remove', data: undefined }}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles async onConfirm', async () => {
        const mockSetActive = vi.fn();
        const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

        render(
            <MockApp active={{ action: 'remove', data: { data: 'Test' } }} setActive={mockSetActive}>
                <ActiveRemoveConfirmation onConfirm={mockOnConfirm} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(mockOnConfirm).toHaveBeenCalledWith({ data: 'Test' });
        expect(mockSetActive).toHaveBeenCalledWith();
    });

    it('does not render modal when active is undefined', () => {
        render(
            <MockApp active={undefined}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render modal when active.action is undefined', () => {
        render(
            <MockApp active={{ data: { data: 'Test' } }}>
                <ActiveRemoveConfirmation />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
