import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import React from 'react';
import ValueRow from '~/client/details/ValueRow';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';
import { useAddMissing } from '~/state/missing/useAddMissing';
import { useRemoveMissing } from '~/state/missing/useRemoveMissing';
import { useHasRemoving } from '~/state/removing/useHasRemoving';
import { useUpdateRemoving } from '~/state/removing/useUpdateRemoving';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useUpdateDetails', () => ({
    useUpdateDetails: jest.fn(),
}));
jest.mock('~/state/missing/useAddMissing', () => ({
    useAddMissing: jest.fn(),
}));
jest.mock('~/state/missing/useRemoveMissing', () => ({
    useRemoveMissing: jest.fn(),
}));
jest.mock('~/state/removing/useHasRemoving', () => ({
    useHasRemoving: jest.fn(),
}));
jest.mock('~/state/removing/useUpdateRemoving', () => ({
    useUpdateRemoving: jest.fn(),
}));
jest.mock('~/state/years/useYears', () => ({
    useYears: jest.fn().mockReturnValue([21, 22, 23]),
}));

describe('ValueRow', () => {
    const userEvent = UserEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const defaultProps = {
        group: 'Group',
        name: 'Name',
    };

    const updateDetails = jest.fn();
    const addMissing = jest.fn();
    const removeMissing = jest.fn();
    const updateRemoving = jest.fn();

    beforeAll(() => {
        (useUpdateDetails as jest.Mock).mockReturnValue(updateDetails);
        (useAddMissing as jest.Mock).mockReturnValue(addMissing);
        (useRemoveMissing as jest.Mock).mockReturnValue(removeMissing);
        (useUpdateRemoving as jest.Mock).mockReturnValue(updateRemoving);
    });

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => jest.useRealTimers());

    describe('with value', () => {
        const props = { ...defaultProps, values: { 20: { '': 1 }, 21: { '': 2 } } };

        it('renders into the document', () => {
            render(<ValueRow {...props} />, withReduxState());
            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells with values only for matching years', () => {
            render(<ValueRow {...props} />, withReduxState());
            expect(screen.getByRole('cell', { name: '2' })).toBeInTheDocument();
            expect(screen.queryByRole('cell', { name: '1' })).not.toBeInTheDocument();
        });

        it('renders cells without values', () => {
            render(<ValueRow {...props} />, withReduxState());
            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(2);
        });

        it('renders last cell with last class', () => {
            render(<ValueRow {...props} />, withReduxState());
            const [beforeLastCell, lastCell] = screen.getAllByRole('cell').slice(-2);
            expect(beforeLastCell).not.toHaveClass('last');
            expect(lastCell).toHaveClass('last');
        });

        it('renders name cell without unavailable class', () => {
            render(<ValueRow {...props} />, withReduxState());
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).not.toHaveClass('unavailable');
        });

        it('renders name cell without removing class', () => {
            render(<ValueRow {...props} />, withReduxState());
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders name cell with removing class', () => {
            (useHasRemoving as jest.Mock).mockReturnValue(true);
            render(<ValueRow {...props} />, withReduxState());
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).toHaveClass('removing');
        });

        it('renders available row checkbox', async () => {
            render(<ValueRow {...props} />, withReduxState());
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeEnabled();
            expect(checkbox).toBeChecked();
        });

        it('calls addMissing when clicking on available row checkbox', async () => {
            render(<ValueRow {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('checkbox'));
            expect(addMissing).toHaveBeenCalledWith(props.group, props.name);
            expect(removeMissing).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(<ValueRow {...props} isMissing />, withReduxState());
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeEnabled();
            expect(checkbox).not.toBeChecked();
        });

        it('calls removeMissing when clicking on unchecked checkbox', async () => {
            render(<ValueRow {...props} isMissing />, withReduxState());
            await userEvent.click(screen.getByRole('checkbox'));
            expect(removeMissing).toHaveBeenCalledWith(props.group, props.name);
            expect(addMissing).not.toHaveBeenCalled();
        });

        it('calls addMissing when clicking on name cell', async () => {
            render(<ValueRow {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: props.name }));
            act(() => jest.advanceTimersByTime(100));
            expect(addMissing).toHaveBeenCalledWith(props.group, props.name);
            expect(removeMissing).not.toHaveBeenCalled();
        });

        it('calls removeMissing when clicking on missing name cell', async () => {
            render(<ValueRow {...props} isMissing />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: props.name }));
            act(() => jest.advanceTimersByTime(100));
            expect(removeMissing).toHaveBeenCalledWith(props.group, props.name);
            expect(addMissing).not.toHaveBeenCalled();
        });

        it('calls updateDetails, updateRemoving and removeMissing when updating a value', async () => {
            render(<ValueRow {...props} isMissing />, withReduxState());
            await userEvent.click(screen.getByRole('cell', { name: '2' }));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('spinbutton', { name: 'Increase' }));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(updateDetails).toHaveBeenCalledWith(props.group, props.name, 21, { '': 3 }, false);
            expect(updateRemoving).toHaveBeenCalledWith(props.group, props.name, 21, false);
            expect(removeMissing).toHaveBeenCalledWith(props.group, props.name);
        });

        it('does not call updateDetails, updateRemoving and removeMissing for unchanged value', async () => {
            render(<ValueRow {...props} isMissing />, withReduxState());
            await userEvent.click(screen.getByRole('cell', { name: '2' }));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(updateDetails).not.toHaveBeenCalled();
            expect(updateRemoving).not.toHaveBeenCalled();
            expect(removeMissing).not.toHaveBeenCalled();
        });
    });

    describe('without value', () => {
        const props = { ...defaultProps, values: {} };

        it('renders into the document', () => {
            render(<ValueRow {...props} />, withReduxState());
            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells without values', () => {
            render(<ValueRow {...props} />, withReduxState());
            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(3);
        });

        it('renders last cell with last class', () => {
            render(<ValueRow {...props} />, withReduxState());
            const [beforeLastCell, lastCell] = screen.getAllByRole('cell').slice(-2);
            expect(beforeLastCell).not.toHaveClass('last');
            expect(lastCell).toHaveClass('last');
        });

        it('renders name cell without unavailable class', () => {
            render(<ValueRow {...props} />, withReduxState());
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).toHaveClass('unavailable');
        });

        it('renders name cell without removing class', () => {
            render(<ValueRow {...props} />, withReduxState());
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders name cell without removing class even has removing', () => {
            (useHasRemoving as jest.Mock).mockReturnValue(true);
            render(<ValueRow {...props} />, withReduxState());
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders available row checkbox', async () => {
            render(<ValueRow {...props} />, withReduxState());
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeDisabled();
            expect(checkbox).toBePartiallyChecked();
        });

        it('does not call addMissing when clicking on available row checkbox', async () => {
            render(<ValueRow {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('checkbox'));
            expect(addMissing).not.toHaveBeenCalled();
            expect(removeMissing).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(<ValueRow {...props} isMissing />, withReduxState());
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeDisabled();
            expect(checkbox).toBePartiallyChecked();
        });

        it('does not call removeMissing when clicking on missing row checkbox', async () => {
            render(<ValueRow {...props} isMissing />, withReduxState());
            await userEvent.click(screen.getByRole('checkbox'));
            expect(removeMissing).not.toHaveBeenCalledWith();
            expect(addMissing).not.toHaveBeenCalled();
        });

        it('does not call addMissing when clicking on name cell', async () => {
            render(<ValueRow {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: props.name }));
            act(() => jest.advanceTimersByTime(100));
            expect(addMissing).not.toHaveBeenCalled();
            expect(removeMissing).not.toHaveBeenCalled();
        });

        it('does not call removeMissing when clicking on missing name cell', async () => {
            render(<ValueRow {...props} isMissing />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: props.name }));
            act(() => jest.advanceTimersByTime(100));
            expect(removeMissing).not.toHaveBeenCalled();
            expect(addMissing).not.toHaveBeenCalled();
        });
    });
});
