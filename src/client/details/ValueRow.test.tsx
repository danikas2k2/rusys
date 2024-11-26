import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import React from 'react';
import { ValueRow, type ValueRowProps } from '~/client/details/ValueRow';
import { useHasRemoving } from '~/state/details/useHasRemoving';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { type WithVariantsState } from '~/state/variants/types';
import { getDetailsFixture, getVariantsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useUpdateDetails', () => ({
    useUpdateDetails: jest.fn(),
}));
jest.mock('~/state/details/useSetDetailsMissing', () => ({
    useSetDetailsMissing: jest.fn(),
}));
jest.mock('~/state/details/useSetDetailsRemoving', () => ({
    useSetDetailsRemoving: jest.fn(),
}));
jest.mock('~/state/details/useHasRemoving', () => ({
    useHasRemoving: jest.fn(),
}));
jest.mock('~/state/years/useYears');

describe('ValueRow', () => {
    const userEvent = UserEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const updateAmounts = jest.fn();
    const setMissing = jest.fn();
    const setRemoving = jest.fn();

    beforeAll(() => {
        (useUpdateDetails as jest.Mock).mockReturnValue(updateAmounts);
        (useSetDetailsMissing as jest.Mock).mockReturnValue(setMissing);
        (useSetDetailsRemoving as jest.Mock).mockReturnValue(setRemoving);
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

    describe('with value', () => {
        it('renders into the document', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells with values only for matching years', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            expect(screen.getByRole('cell', { name: '2 p' })).toBeInTheDocument();
            expect(screen.queryByRole('cell', { name: '1 p' })).not.toBeInTheDocument();
        });

        it('renders cells without values', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(2);
        });

        it('renders last cell with last class', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const [beforeLastCell, lastCell] = screen.getAllByRole('cell').slice(-2);
            expect(beforeLastCell).not.toHaveClass('last');
            expect(lastCell).toHaveClass('last');
        });

        it('renders name cell without unavailable class', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name });
            expect(cell).not.toHaveClass('unavailable');
        });

        it('renders name cell without removing class', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders name cell with removing class', () => {
            (useHasRemoving as jest.Mock).mockReturnValue(true);
            render(<ValueRow {...props} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name });
            expect(cell).toHaveClass('removing');
        });

        it('renders available row checkbox', async () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeEnabled();
            expect(checkbox).toBeChecked();
        });

        it('calls setMissing with true when clicking on available row checkbox', async () => {
            render(<ValueRow {...props} />, withReduxState(state));
            await userEvent.click(screen.getByRole('checkbox'));
            expect(setMissing).toHaveBeenCalledWith(group, name, true);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeEnabled();
            expect(checkbox).not.toBeChecked();
        });

        it('calls setMissing with false when clicking on unchecked checkbox', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('checkbox'));
            expect(setMissing).toHaveBeenCalledWith(group, name, false);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setMissing with true when clicking on name cell', async () => {
            render(<ValueRow {...props} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name }));
            act(() => jest.advanceTimersByTime(100));
            expect(setMissing).toHaveBeenCalledWith(group, name, true);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setMissing with false when clicking on missing name cell', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name }));
            act(() => jest.advanceTimersByTime(100));
            expect(setMissing).toHaveBeenCalledWith(group, name, false);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls updateAmounts only when increasing a value', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByText('2'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByLabelText('Increase'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByText('Update'));
            expect(updateAmounts).toHaveBeenCalledWith(group, name, year, [{ variant: 'p', amount: 1 }]);
            expect(setRemoving).not.toHaveBeenCalled();
            expect(setMissing).not.toHaveBeenCalled();
        });

        it('calls updateAmounts and setMissing when decreasing a value', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByText('2'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByLabelText('Decrease'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByText('Update'));
            expect(updateAmounts).toHaveBeenCalledWith(group, name, year, [{ variant: 'p', amount: -1 }]);
        });

        it('calls updateAmounts, setMissing, and setRemoving when decreasing a value to zero', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByText('2'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByLabelText('Decrease'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByLabelText('Decrease'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByText('Update'));
            expect(updateAmounts).toHaveBeenCalledWith(group, name, year, [{ variant: 'p', amount: -2 }]);
        });

        it('does not call setAmounts, setMissing and setRemoving for unchanged value', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('cell', { name: '2 p' }));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(updateAmounts).not.toHaveBeenCalled();
        });
    });

    describe('without value', () => {
        it('renders into the document', () => {
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells without values', () => {
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(3);
        });

        it('renders last cell with last class', () => {
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            const [beforeLastCell, lastCell] = screen.getAllByRole('cell').slice(-2);
            expect(beforeLastCell).not.toHaveClass('last');
            expect(lastCell).toHaveClass('last');
        });

        it('renders name cell without unavailable class', () => {
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name });
            expect(cell).toHaveClass('unavailable');
        });

        it('renders name cell without removing class', () => {
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders name cell without removing class even has removing', () => {
            (useHasRemoving as jest.Mock).mockReturnValue(true);
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders available row checkbox', async () => {
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeDisabled();
            expect(checkbox).toBePartiallyChecked();
        });

        it('does not call addMissing when clicking on available row checkbox', async () => {
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            await userEvent.click(screen.getByRole('checkbox'));
            expect(setMissing).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(<ValueRow {...props} years={[]} missing />, withReduxState(state));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeDisabled();
            expect(checkbox).toBePartiallyChecked();
        });

        it('does not call setRemoving when clicking on missing row checkbox', async () => {
            render(<ValueRow {...props} years={[]} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('checkbox'));
            expect(setRemoving).not.toHaveBeenCalledWith();
            expect(setMissing).not.toHaveBeenCalled();
        });

        it('does not call addMissing when clicking on name cell', async () => {
            render(<ValueRow {...props} years={[]} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name }));
            act(() => jest.advanceTimersByTime(100));
            expect(setMissing).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('does not call setRemoving when clicking on missing name cell', async () => {
            render(<ValueRow {...props} years={[]} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name }));
            act(() => jest.advanceTimersByTime(100));
            expect(setRemoving).not.toHaveBeenCalled();
            expect(setMissing).not.toHaveBeenCalled();
        });
    });
});
