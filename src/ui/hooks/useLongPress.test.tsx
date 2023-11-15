import { fireEvent } from '@testing-library/dom';
import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import React, { type ReactNode } from 'react';
import { type PressEventHandler, useLongPress } from './useLongPress';

describe('useLongPress', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    function TestComponent({
        onLongPress,
        onShortPress,
        duration,
        shortDelay,
        children,
    }: {
        onLongPress: PressEventHandler;
        onShortPress?: PressEventHandler;
        duration?: number;
        shortDelay?: number;
        children?: ReactNode;
    }): JSX.Element {
        const events = useLongPress<HTMLDivElement>(onLongPress, onShortPress, duration, shortDelay);
        return (
            <div role="button" {...events}>
                {children}
            </div>
        );
    }

    const onLongPress = jest.fn();
    const onShortPress = jest.fn();

    const userEvent = UserEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // TODO use userEvent.pointer()
    describe('mouse events', () => {
        it('triggers onLongPress after duration', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await userEvent.pointer({ target: screen.getByRole('button'), keys: '[MouseLeft>]' });
            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress if duration has not passed', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await userEvent.pointer({ target: screen.getByRole('button'), keys: '[MouseLeft>]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('triggers onShortPress if duration has not passed and pointer is released', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} shortDelay={0} />);

            await userEvent.pointer({ target: screen.getByRole('button'), keys: '[MouseLeft]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).toHaveBeenCalled();
        });

        it('triggers onShortPress after short delay if duration has not passed and pointer is released', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await userEvent.pointer({ target: screen.getByRole('button'), keys: '[MouseLeft]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(onShortPress).toHaveBeenCalled();
        });

        it('stops long press timer on pointer move', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await userEvent.pointer([
                { target: screen.getByRole('button'), keys: '[MouseLeft>]' },
                { target: document.body },
            ]);
            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });
    });

    describe('touch events', () => {
        // TODO use userEvent.pointer() when touch event will be available

        it('triggers onLongPress after duration', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            act(() => fireEvent.touchStart(screen.getByRole('button')));
            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress if duration has not passed', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            act(() => fireEvent.touchStart(screen.getByRole('button')));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('triggers onShortPress if duration has not passed and pointer is released', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} shortDelay={0} />);

            act(() => fireEvent.touchStart(screen.getByRole('button')));
            act(() => fireEvent.touchEnd(screen.getByRole('button')));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).toHaveBeenCalled();
        });

        it('triggers onShortPress after short delay if duration has not passed and pointer is released', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            act(() => fireEvent.touchStart(screen.getByRole('button')));
            act(() => fireEvent.touchEnd(screen.getByRole('button')));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(onShortPress).toHaveBeenCalled();
        });

        it('stops long press timer on pointer move', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            act(() => fireEvent.touchStart(screen.getByRole('button')));
            act(() => fireEvent.touchMove(screen.getByRole('button')));
            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });
    });

    describe('pointer events', () => {
        beforeEach(() => {
            window.PointerEvent = window.PointerEvent ?? window.MouseEvent;
        });

        it('triggers onLongPress after duration', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await userEvent.pointer({ target: screen.getByRole('button'), keys: '[TouchA>]' });
            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress if duration has not passed', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await userEvent.pointer({ target: screen.getByRole('button'), keys: '[TouchA>]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('triggers onShortPress if duration has not passed and pointer is released', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} shortDelay={0} />);

            await userEvent.pointer({ target: screen.getByRole('button'), keys: '[TouchA]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).toHaveBeenCalled();
        });

        it('triggers onShortPress after short delay if duration has not passed and pointer is released', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await userEvent.pointer({ target: screen.getByRole('button'), keys: '[TouchA]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(onShortPress).toHaveBeenCalled();
        });

        it('stops long press timer on pointer move', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await userEvent.pointer([
                { target: screen.getByRole('button'), keys: '[TouchA>]' },
                { target: document.body, pointerName: 'TouchA' },
            ]);
            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });
    });
});
