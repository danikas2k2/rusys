import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import React from 'react';
import { InteractiveName } from '~/client/InteractiveName';
import { withReduxState } from '~/tests/withReduxState';

describe('InteractiveName', () => {
    beforeEach(() => jest.useFakeTimers());

    afterAll(() => jest.useRealTimers());

    const userEvent = UserEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    it('should render name', () => {
        render(<InteractiveName name="Name" />, withReduxState());
        expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
    });

    it('should trigger onClick when clicked', async () => {
        const handleClick = jest.fn();
        render(<InteractiveName name="Name" onClick={handleClick} />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Name' }));
        jest.advanceTimersByTime(100);
        expect(handleClick).toHaveBeenCalled();
    });

    it('should open DetailsBox on long press', async () => {
        render(<InteractiveName name="Name" />, withReduxState());
        await userEvent.pointer({
            target: screen.getByRole('button', { name: 'Name' }),
            keys: '[MouseLeft>]',
        });
        act(() => jest.advanceTimersByTime(500));
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });

    it('should not open DetailsBox on short press', async () => {
        render(<InteractiveName name="Name" />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Name' }));
        jest.advanceTimersByTime(100);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
