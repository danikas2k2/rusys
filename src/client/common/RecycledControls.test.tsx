import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecycledContextWrapper } from '~/client/common/RecycledContext';
import { RecycledControls } from '~/client/common/RecycledControls';

describe('<RecycledControls>', () => {
    it('renders control buttons', () => {
        render(
            <RecycledContextWrapper>
                <RecycledControls />
            </RecycledContextWrapper>
        );

        expect(screen.getByText('Consumed')).toBeInTheDocument();
        expect(screen.getByText('Recycled')).toBeInTheDocument();
    });

    it('renders Consumed button to be checked by default', () => {
        render(
            <RecycledContextWrapper>
                <RecycledControls />
            </RecycledContextWrapper>
        );

        expect(screen.getByText('Consumed')).toBeChecked();
        expect(screen.getByText('Recycled')).not.toBeChecked();
    });

    it('toggles to Recycled state by click', async () => {
        render(
            <RecycledContextWrapper>
                <RecycledControls />
            </RecycledContextWrapper>
        );
        await userEvent.click(screen.getByText('Recycled'));

        expect(screen.getByText('Recycled')).toBeChecked();
        expect(screen.getByText('Consumed')).not.toBeChecked();
    });

    it('toggles to Consumed state by click', async () => {
        render(
            <RecycledContextWrapper>
                <RecycledControls />
            </RecycledContextWrapper>
        );
        await userEvent.click(screen.getByText('Recycled'));
        await userEvent.click(screen.getByText('Consumed'));

        expect(screen.getByText('Consumed')).toBeChecked();
        expect(screen.getByText('Recycled')).not.toBeChecked();
    });

    it('renders Consumed with amount', async () => {
        render(
            <RecycledContextWrapper>
                <RecycledControls consumedAmount={10} />
            </RecycledContextWrapper>
        );

        expect(within(screen.getByText('Consumed')).getByText('10')).toBeInTheDocument();
    });

    it('renders Recycled with amount', async () => {
        render(
            <RecycledContextWrapper>
                <RecycledControls recycledAmount={10} />
            </RecycledContextWrapper>
        );

        expect(within(screen.getByText('Recycled')).getByText('10')).toBeInTheDocument();
    });
});
