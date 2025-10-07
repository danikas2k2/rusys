import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { UpdateTypeContextWrapper, UpdateTypes } from '~/client/app/common/UpdateTypeContext';
import { UpdateTypeToggle } from '~/client/app/common/UpdateTypeToggle';

describe('<UpdateTypeToggle>', () => {
    it('renders control buttons', () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle />
            </UpdateTypeContextWrapper>
        );

        expect(screen.getByLabelText('Consumed')).toBeInTheDocument();
        expect(screen.getByLabelText('Updated')).toBeInTheDocument();
        expect(screen.getByLabelText('Recycled')).toBeInTheDocument();
    });

    it('renders control buttons without Updated', () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle updated={false} />
            </UpdateTypeContextWrapper>
        );

        expect(screen.getByLabelText('Consumed')).toBeInTheDocument();
        expect(screen.getByLabelText('Recycled')).toBeInTheDocument();
        expect(screen.queryByLabelText('Updated')).not.toBeInTheDocument();
    });

    it('renders Consumed button to be checked by default', () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle />
            </UpdateTypeContextWrapper>
        );

        expect(screen.getByLabelText('Consumed')).toBeChecked();
        expect(screen.getByLabelText('Updated')).not.toBeChecked();
        expect(screen.getByLabelText('Recycled')).not.toBeChecked();
    });

    it('toggles to Updated state by click', async () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle />
            </UpdateTypeContextWrapper>
        );
        await userEvent.click(screen.getByLabelText('Updated'));

        expect(screen.getByLabelText('Updated')).toBeChecked();
        expect(screen.getByLabelText('Consumed')).not.toBeChecked();
        expect(screen.getByLabelText('Recycled')).not.toBeChecked();
    });

    it('toggles to Recycled state by click', async () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle />
            </UpdateTypeContextWrapper>
        );
        await userEvent.click(screen.getByLabelText('Recycled'));

        expect(screen.getByLabelText('Recycled')).toBeChecked();
        expect(screen.getByLabelText('Updated')).not.toBeChecked();
        expect(screen.getByLabelText('Consumed')).not.toBeChecked();
    });

    it('toggles to Consumed state by click', async () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle />
            </UpdateTypeContextWrapper>
        );
        await userEvent.click(screen.getByLabelText('Recycled'));
        await userEvent.click(screen.getByLabelText('Consumed'));

        expect(screen.getByLabelText('Consumed')).toBeChecked();
        expect(screen.getByLabelText('Updated')).not.toBeChecked();
        expect(screen.getByLabelText('Recycled')).not.toBeChecked();
    });

    it('renders Consumed with amount', async () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle changes={{ [UpdateTypes.Consumed]: [{ variant: 'p', amount: 3 }] }} />
            </UpdateTypeContextWrapper>
        );

        expect(within(screen.getByLabelText('Consumed')).getByText('3')).toBeInTheDocument();
    });

    it('renders Updated with amount', async () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle changes={{ [UpdateTypes.Updated]: [{ variant: 'p', amount: 5 }] }} />
            </UpdateTypeContextWrapper>
        );

        expect(within(screen.getByLabelText('Updated')).getByText('5')).toBeInTheDocument();
    });

    it('renders Recycled with amount', async () => {
        render(
            <UpdateTypeContextWrapper>
                <UpdateTypeToggle changes={{ [UpdateTypes.Recycled]: [{ variant: 'p', amount: 7 }] }} />
            </UpdateTypeContextWrapper>
        );

        expect(within(screen.getByLabelText('Recycled')).getByText('7')).toBeInTheDocument();
    });
});
