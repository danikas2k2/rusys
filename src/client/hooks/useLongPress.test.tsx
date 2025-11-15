import { fireEvent } from '@testing-library/dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { dispatchNativeCancelEvents } from '~/client/utils/pointEvents';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
    beforeEach(() => jest.useFakeTimers());

    afterEach(() => jest.clearAllMocks());

    afterAll(() => jest.useRealTimers());

    function TestComponent({
        onLongPress,
        onShortPress,
        duration,
        shortDelay,
        children,
    }: React.PropsWithChildren<{
        onLongPress: React.PointerEventHandler;
        onShortPress?: React.PointerEventHandler;
        duration?: number;
        shortDelay?: number;
    }>): React.ReactElement {
        const events = useLongPress<HTMLDivElement>(onLongPress, onShortPress, duration, shortDelay);
        return (
            <div role="button" {...events}>
                {children}
            </div>
        );
    }

    const onLongPress = jest.fn();
    const onShortPress = jest.fn();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    describe('pointer events', () => {
        it('triggers onLongPress after duration', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA>]' });
            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.event('pointerdown'));
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress if duration has not passed', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA>]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('triggers onShortPress if duration has not passed and pointer is released', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} shortDelay={0} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).toHaveBeenCalledWith(expect.event('pointerup'));
        });

        it('triggers onShortPress after short delay if duration has not passed and pointer is released', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).toHaveBeenCalledWith(expect.event('pointerup'));
        });

        it('stops long press timer on pointer move', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await user.pointer([
                { target: screen.getByRole('button'), keys: '[TouchA>]' },
                { target: document.body, pointerName: 'TouchA' },
            ]);
            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });
    });

    describe('cancel functionality', () => {
        it('cancels longpress timer when dispatchNativeCancelEvents is called', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[MouseLeft>]' });

            // Dispatch cancel events
            dispatchNativeCancelEvents(button);

            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            // onShortPress may still be called if pointerup fires after cancel, which is expected behavior
        });

        it('cancels longpress timer when pointercancel event is fired', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[MouseLeft>]' });

            // Fire pointercancel event
            act(() => {
                fireEvent.pointerCancel(button);
            });

            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            // onShortPress may still be called if pointerup fires after cancel, which is expected behavior
        });
    });
});
