import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RecycledControls } from '~/client/common/RecycledControls';
import { withRecycledContext } from '~/tests/withRecycledContext';

describe('RecycledControls', () => {
    it('renders control buttons', () => {
        render(<RecycledControls />, withRecycledContext());
        expect(screen.getByText('Consumed')).toBeInTheDocument();
        expect(screen.getByText('Recycled')).toBeInTheDocument();
    });

    it('renders Consumed button to be checked by default', () => {
        render(<RecycledControls />, withRecycledContext());
        expect(screen.getByText('Consumed')).toBeChecked();
        expect(screen.getByText('Recycled')).not.toBeChecked();
    });

    it('toggles to Recycled state by click', async () => {
        render(<RecycledControls />, withRecycledContext());
        await userEvent.click(screen.getByText('Recycled'));
        expect(screen.getByText('Recycled')).toBeChecked();
        expect(screen.getByText('Consumed')).not.toBeChecked();
    });

    it('toggles to Consumed state by click', async () => {
        render(<RecycledControls />, withRecycledContext());
        await userEvent.click(screen.getByText('Recycled'));
        await userEvent.click(screen.getByText('Consumed'));
        expect(screen.getByText('Consumed')).toBeChecked();
        expect(screen.getByText('Recycled')).not.toBeChecked();
    });

    it('renders Consumed with amount', async () => {
        render(<RecycledControls consumedAmount={10} />, withRecycledContext());
        expect(within(screen.getByText('Consumed')).getByText('10')).toBeInTheDocument();
    });

    it('renders Recycled with amount', async () => {
        render(<RecycledControls recycledAmount={10} />, withRecycledContext());
        expect(within(screen.getByText('Recycled')).getByText('10')).toBeInTheDocument();
    });
});
