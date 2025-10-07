import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { getDetailsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { ValueRow, type ValueRowProps } from '~/client/app/details/ValueRow';
import { useHasRemoving } from '~/client/state/details/useHasRemoving';
import { useSetDetailsMissing } from '~/client/state/details/useSetDetailsMissing';
import { useSetDetailsRemoving } from '~/client/state/details/useSetDetailsRemoving';
import { useUpdateDetails } from '~/client/state/details/useUpdateDetails';
import { DEV_MODE_EMAIL } from '~/client/state/profile/dev';
import { type WithVariantsState } from '~/client/state/variants/types';

jest.mock('~/client/state/details/useUpdateDetails', () => ({
    useUpdateDetails: jest.fn(),
}));
jest.mock('~/client/state/details/useSetDetailsMissing', () => ({
    useSetDetailsMissing: jest.fn(),
}));
jest.mock('~/client/state/details/useSetDetailsRemoving', () => ({
    useSetDetailsRemoving: jest.fn(),
}));
jest.mock('~/client/state/details/useHasRemoving', () => ({
    useHasRemoving: jest.fn(),
}));
jest.mock('~/client/state/years/useYears');
jest.mock('~/client/state/profile/useProfile');

describe('<ValueRow>', () => {
    const userEvent = UserEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const updateAmounts = jest.fn();
    const setMissing = jest.fn();
    const setRemoving = jest.fn();

    beforeAll(() => {
        jest.mocked(useUpdateDetails).mockReturnValue(updateAmounts);
        jest.mocked(useSetDetailsMissing).mockReturnValue(setMissing);
        jest.mocked(useSetDetailsRemoving).mockReturnValue(setRemoving);
    });

    beforeEach(() => jest.useFakeTimers());

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => jest.useRealTimers());

    const variants = getVariantsFixture();
    const state: WithVariantsState = { variants };
    const details = getDetailsFixture();
    const props: ValueRowProps = details[3];
    const { group, name, years: [{ year }] = [] } = props;
    const user = DEV_MODE_EMAIL;

    describe('with value', () => {
        it('renders into the document', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );

            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells with values only for matching years', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );

            expect(screen.getByRole('cell', { name: '2' })).toBeInTheDocument();
            expect(screen.queryByRole('cell', { name: '1' })).not.toBeInTheDocument();
        });

        it('renders cells without values', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );

            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(2);
        });

        it('renders last cell with last class', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );
            const [beforeLastCell, lastCell] = screen.getAllByRole('cell').slice(-2);

            expect(beforeLastCell).not.toHaveClass('last');
            expect(lastCell).toHaveClass('last');
        });

        it('renders name cell without unavailable class', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );
            const [, cell] = screen.getAllByRole('cell', { name });

            expect(cell).not.toHaveClass('unavailable');
        });

        it('renders name cell without removing class', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );
            const [, cell] = screen.getAllByRole('cell', { name });

            expect(cell).not.toHaveClass('removing');
        });

        it('renders name cell with removing class', () => {
            jest.mocked(useHasRemoving).mockReturnValue(true);
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );
            const [, cell] = screen.getAllByRole('cell', { name });

            expect(cell).toHaveClass('removing');
        });

        it('renders available row checkbox', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );
            const checkbox = screen.getByRole('checkbox');

            expect(checkbox).toBeEnabled();
            expect(checkbox).toBeChecked();
        });

        it('calls setMissing with true when clicking on available row checkbox', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('checkbox'));

            expect(setMissing).toHaveBeenCalledWith(group, name, true);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} missing />
                </MockRedux>
            );
            const checkbox = screen.getByRole('checkbox');

            expect(checkbox).toBeEnabled();
            expect(checkbox).not.toBeChecked();
        });

        it('calls setMissing with false when clicking on unchecked checkbox', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} missing />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('checkbox'));

            expect(setMissing).toHaveBeenCalledWith(group, name, false);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setMissing with true when clicking on name cell', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name }));
            act(() => jest.advanceTimersByTime(100));

            expect(setMissing).toHaveBeenCalledWith(group, name, true);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setMissing with false when clicking on missing name cell', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} missing />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name }));
            act(() => jest.advanceTimersByTime(100));

            expect(setMissing).toHaveBeenCalledWith(group, name, false);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls updateAmounts only when increasing a value', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} missing />
                </MockRedux>
            );
            await userEvent.click(screen.getByText('2'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByLabelText('Increase'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByText('Update'));

            expect(updateAmounts).toHaveBeenCalledWith(
                group,
                name,
                year,
                [{ variant: 'p', amount: 1, recycled: false }],
                user
            );
            expect(setRemoving).not.toHaveBeenCalled();
            expect(setMissing).not.toHaveBeenCalled();
        });

        it('calls updateAmounts and setMissing when decreasing a value', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} missing />
                </MockRedux>
            );
            await userEvent.click(screen.getByText('2'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByLabelText('Decrease'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByText('Update'));

            expect(updateAmounts).toHaveBeenCalledWith(
                group,
                name,
                year,
                [{ variant: 'p', amount: -1, recycled: false }],
                user
            );
        });

        it('calls updateAmounts, setMissing, and setRemoving when decreasing a value to zero', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} missing />
                </MockRedux>
            );
            await userEvent.click(screen.getByText('2'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByLabelText('Decrease'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByLabelText('Decrease'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByText('Update'));

            expect(updateAmounts).toHaveBeenCalledWith(
                group,
                name,
                year,
                [{ variant: 'p', amount: -2, recycled: false }],
                user
            );
        });

        it('does not call setAmounts, setMissing and setRemoving for unchanged value', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} missing />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('cell', { name: '2' }));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));

            expect(updateAmounts).not.toHaveBeenCalled();
        });
    });

    describe('without value', () => {
        it('renders into the document', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );

            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells without values', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );

            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(3);
        });

        it('renders last cell with last class', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );
            const [beforeLastCell, lastCell] = screen.getAllByRole('cell').slice(-2);

            expect(beforeLastCell).not.toHaveClass('last');
            expect(lastCell).toHaveClass('last');
        });

        it('renders name cell without unavailable class', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );
            const [, cell] = screen.getAllByRole('cell', { name });

            expect(cell).toHaveClass('unavailable');
        });

        it('renders name cell without removing class', () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );
            const [, cell] = screen.getAllByRole('cell', { name });

            expect(cell).not.toHaveClass('removing');
        });

        it('renders name cell without removing class even has removing', () => {
            jest.mocked(useHasRemoving).mockReturnValue(true);
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );
            const [, cell] = screen.getAllByRole('cell', { name });

            expect(cell).not.toHaveClass('removing');
        });

        it('renders available row checkbox', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );
            const checkbox = screen.getByRole('checkbox');

            expect(checkbox).toBeDisabled();
            expect(checkbox).toBePartiallyChecked();
        });

        it('does not call addMissing when clicking on available row checkbox', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('checkbox'));

            expect(setMissing).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} missing />
                </MockRedux>
            );
            const checkbox = screen.getByRole('checkbox');

            expect(checkbox).toBeDisabled();
            expect(checkbox).toBePartiallyChecked();
        });

        it('does not call setRemoving when clicking on missing row checkbox', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} missing />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('checkbox'));

            expect(setRemoving).not.toHaveBeenCalledWith();
            expect(setMissing).not.toHaveBeenCalled();
        });

        it('does not call addMissing when clicking on name cell', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name }));
            act(() => jest.advanceTimersByTime(100));

            expect(setMissing).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('does not call setRemoving when clicking on missing name cell', async () => {
            render(
                <MockRedux state={state}>
                    <ValueRow {...props} years={[]} missing />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name }));
            act(() => jest.advanceTimersByTime(100));

            expect(setRemoving).not.toHaveBeenCalled();
            expect(setMissing).not.toHaveBeenCalled();
        });
    });
});
