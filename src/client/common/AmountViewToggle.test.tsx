import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { AmountViewWrapper } from '~/client/common/AmountViewContext';
import { AmountViewToggle } from '~/client/common/AmountViewToggle';

describe('<AmountViewToggle>', () => {
    it('renders control buttons', () => {
        render(
            <MockApp>
                <AmountViewWrapper>
                    <AmountViewToggle />
                </AmountViewWrapper>
            </MockApp>
        );

        expect(screen.getByRole('radio', { name: 'Detailed' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Total quantity' })).toBeInTheDocument();
    });

    it('renders Total quantity as checked by default', () => {
        render(
            <MockApp>
                <AmountViewWrapper>
                    <AmountViewToggle />
                </AmountViewWrapper>
            </MockApp>
        );

        expect(screen.getByRole('radio', { name: 'Total quantity' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Detailed' })).not.toBeChecked();
    });

    it('toggles to total view by click', async () => {
        render(
            <MockApp>
                <AmountViewWrapper>
                    <AmountViewToggle />
                </AmountViewWrapper>
            </MockApp>
        );
        await user.click(screen.getByRole('radio', { name: 'Total quantity' }));

        expect(screen.getByRole('radio', { name: 'Total quantity' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Detailed' })).not.toBeChecked();
    });

    it('toggles back to detailed view by click', async () => {
        render(
            <MockApp>
                <AmountViewWrapper>
                    <AmountViewToggle />
                </AmountViewWrapper>
            </MockApp>
        );
        await user.click(screen.getByRole('radio', { name: 'Total quantity' }));
        await user.click(screen.getByRole('radio', { name: 'Detailed' }));

        expect(screen.getByRole('radio', { name: 'Detailed' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Total quantity' })).not.toBeChecked();
    });
});
