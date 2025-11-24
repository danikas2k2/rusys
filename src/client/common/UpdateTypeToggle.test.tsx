import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { UpdateTypeToggle } from '~/client/common/UpdateTypeToggle';

describe('<UpdateTypeToggle>', () => {
    it('renders control buttons', () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByRole('radio', { name: 'Consumed' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Updated' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Recycled' })).toBeInTheDocument();
    });

    it('renders control buttons without Updated', () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle updated={false} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByRole('radio', { name: 'Consumed' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Recycled' })).toBeInTheDocument();
        expect(screen.queryByRole('radio', { name: 'Updated' })).not.toBeInTheDocument();
    });

    it('renders Consumed button to be checked by default', () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle />
                </UpdateTypeWrapper>
            </MockApp>
        );

        const consumedRadio = screen.getByRole('radio', { name: 'Consumed' });
        const updatedRadio = screen.getByRole('radio', { name: 'Updated' });
        const recycledRadio = screen.getByRole('radio', { name: 'Recycled' });

        expect(consumedRadio).toBeChecked();
        expect(updatedRadio).not.toBeChecked();
        expect(recycledRadio).not.toBeChecked();
    });

    it('toggles to Updated state by click', async () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle />
                </UpdateTypeWrapper>
            </MockApp>
        );
        await user.click(screen.getByRole('radio', { name: 'Updated' }));

        const consumedRadio = screen.getByRole('radio', { name: 'Consumed' });
        const updatedRadio = screen.getByRole('radio', { name: 'Updated' });
        const recycledRadio = screen.getByRole('radio', { name: 'Recycled' });

        expect(updatedRadio).toBeChecked();
        expect(consumedRadio).not.toBeChecked();
        expect(recycledRadio).not.toBeChecked();
    });

    it('toggles to Recycled state by click', async () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle />
                </UpdateTypeWrapper>
            </MockApp>
        );
        await user.click(screen.getByRole('radio', { name: 'Recycled' }));

        const consumedRadio = screen.getByRole('radio', { name: 'Consumed' });
        const updatedRadio = screen.getByRole('radio', { name: 'Updated' });
        const recycledRadio = screen.getByRole('radio', { name: 'Recycled' });

        expect(recycledRadio).toBeChecked();
        expect(updatedRadio).not.toBeChecked();
        expect(consumedRadio).not.toBeChecked();
    });

    it('toggles to Consumed state by click', async () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle />
                </UpdateTypeWrapper>
            </MockApp>
        );
        await user.click(screen.getByRole('radio', { name: 'Recycled' }));
        await user.click(screen.getByRole('radio', { name: 'Consumed' }));

        const consumedRadio = screen.getByRole('radio', { name: 'Consumed' });
        const updatedRadio = screen.getByRole('radio', { name: 'Updated' });
        const recycledRadio = screen.getByRole('radio', { name: 'Recycled' });

        expect(consumedRadio).toBeChecked();
        expect(updatedRadio).not.toBeChecked();
        expect(recycledRadio).not.toBeChecked();
    });

    it('renders Consumed with amount', async () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle changes={{ consumed: [{ variant: 'p', amount: 3 }] }} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByText('+3')).toBeInTheDocument();
        expect(screen.getByLabelText('Consumed')).toBeInTheDocument();
    });

    it('renders Updated with amount', async () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle changes={{ updated: [{ variant: 'p', amount: 5 }] }} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByText('+5')).toBeInTheDocument();
        expect(screen.getByLabelText('Updated')).toBeInTheDocument();
    });

    it('renders Recycled with amount', async () => {
        render(
            <MockApp>
                <UpdateTypeWrapper>
                    <UpdateTypeToggle changes={{ recycled: [{ variant: 'p', amount: 7 }] }} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByText('+7')).toBeInTheDocument();
        expect(screen.getByLabelText('Recycled')).toBeInTheDocument();
    });
});
