import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import React from 'react';
import { ValueRow, type ValueRowProps } from '~/client/details/ValueRow';
import { getVariantsFixture } from '~/tests/fixtures';
import { useHasRemoving } from '~/state/details/useHasRemoving';
import { useSetDetailsAmounts } from '~/state/details/useSetDetailsAmounts';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { type WithVariantsState } from '~/state/variants/types';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useSetDetailsAmounts', () => ({
    useSetDetailsAmounts: jest.fn(),
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

    const setAmounts = jest.fn();
    const setMissing = jest.fn();
    const setRemoving = jest.fn();

    beforeAll(() => {
        (useSetDetailsAmounts as jest.Mock).mockReturnValue(setAmounts);
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

    const defaultProps: ValueRowProps = { group: 'G', name: 'C' };
    const variants = getVariantsFixture();
    const state: WithVariantsState = { variants };

    describe('with value', () => {
        const props: ValueRowProps = {
            ...defaultProps,
            amounts: [
                { year: 20, amounts: [{ variant: 'p', amount: 1 }] },
                { year: 21, amounts: [{ variant: 'p', amount: 2 }] },
            ],
        };

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
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).not.toHaveClass('unavailable');
        });

        it('renders name cell without removing class', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders name cell with removing class', () => {
            (useHasRemoving as jest.Mock).mockReturnValue(true);
            render(<ValueRow {...props} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
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
            expect(setMissing).toHaveBeenCalledWith(props.group, props.name, true);
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
            expect(setMissing).toHaveBeenCalledWith(props.group, props.name, false);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setMissing with true when clicking on name cell', async () => {
            render(<ValueRow {...props} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: props.name }));
            act(() => jest.advanceTimersByTime(100));
            expect(setMissing).toHaveBeenCalledWith(props.group, props.name, true);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setMissing with false when clicking on missing name cell', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: props.name }));
            act(() => jest.advanceTimersByTime(100));
            expect(setMissing).toHaveBeenCalledWith(props.group, props.name, false);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setAmounts, setMissing and setRemoving when updating a value', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('cell', { name: '2 p' }));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('spinbutton', { name: 'Increase' }));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(setAmounts).toHaveBeenCalledWith(props.group, props.name, 21, [{ variant: 'p', amount: 3 }], false);
            expect(setRemoving).toHaveBeenCalledWith(props.group, props.name, 21, false);
            expect(setMissing).toHaveBeenCalledWith(props.group, props.name, false);
        });

        it('does not call setAmounts, setMissing and setRemoving for unchanged value', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('cell', { name: '2 p' }));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(setAmounts).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
            expect(setMissing).not.toHaveBeenCalled();
        });
    });

    describe('without value', () => {
        const props: ValueRowProps = { ...defaultProps, amounts: [] };

        it('renders into the document', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells without values', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(3);
        });

        it('renders last cell with last class', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const [beforeLastCell, lastCell] = screen.getAllByRole('cell').slice(-2);
            expect(beforeLastCell).not.toHaveClass('last');
            expect(lastCell).toHaveClass('last');
        });

        it('renders name cell without unavailable class', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).toHaveClass('unavailable');
        });

        it('renders name cell without removing class', () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders name cell without removing class even has removing', () => {
            (useHasRemoving as jest.Mock).mockReturnValue(true);
            render(<ValueRow {...props} />, withReduxState(state));
            const [, cell] = screen.getAllByRole('cell', { name: props.name });
            expect(cell).not.toHaveClass('removing');
        });

        it('renders available row checkbox', async () => {
            render(<ValueRow {...props} />, withReduxState(state));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeDisabled();
            expect(checkbox).toBePartiallyChecked();
        });

        it('does not call addMissing when clicking on available row checkbox', async () => {
            render(<ValueRow {...props} />, withReduxState(state));
            await userEvent.click(screen.getByRole('checkbox'));
            expect(setMissing).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeDisabled();
            expect(checkbox).toBePartiallyChecked();
        });

        it('does not call setRemoving when clicking on missing row checkbox', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('checkbox'));
            expect(setRemoving).not.toHaveBeenCalledWith();
            expect(setMissing).not.toHaveBeenCalled();
        });

        it('does not call addMissing when clicking on name cell', async () => {
            render(<ValueRow {...props} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: props.name }));
            act(() => jest.advanceTimersByTime(100));
            expect(setMissing).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('does not call setRemoving when clicking on missing name cell', async () => {
            render(<ValueRow {...props} missing />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: props.name }));
            act(() => jest.advanceTimersByTime(100));
            expect(setRemoving).not.toHaveBeenCalled();
            expect(setMissing).not.toHaveBeenCalled();
        });
    });
});
