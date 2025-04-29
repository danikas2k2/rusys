import React, { type JSX, type ReactNode } from 'react';
import { fireEvent } from '@testing-library/dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLongPress, type PressEventHandler } from './useLongPress';

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

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    describe('mouse events', () => {
        it('triggers onLongPress after duration', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[MouseLeft>]' });
            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.event('mousedown'));
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress if duration has not passed', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[MouseLeft>]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('triggers onShortPress if duration has not passed and pointer is released', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} shortDelay={0} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[MouseLeft]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).toHaveBeenCalledWith(expect.event('mouseup'));
        });

        it('triggers onShortPress after short delay if duration has not passed and pointer is released', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[MouseLeft]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).toHaveBeenCalledWith(expect.event('mouseup'));
        });

        it('stops long press timer on pointer move', async () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            await user.pointer([
                { target: screen.getByRole('button'), keys: '[MouseLeft>]' },
                { target: document.body },
            ]);
            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('cancels context menu', async () => {
            const onContextMenu = jest.fn();
            render(
                <div onContextMenu={onContextMenu}>
                    <TestComponent onLongPress={onLongPress} />
                </div>
            );

            await user.pointer([{ target: screen.getByRole('button'), keys: '[MouseRight]' }]);

            expect(onContextMenu).not.toHaveBeenCalled();
        });
    });

    describe('touch events', () => {
        // TODO use user.pointer() when touch event will be available

        it('triggers onLongPress after duration', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            act(() => fireEvent.touchStart(screen.getByRole('button')));
            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.event('touchstart'));
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
            expect(onShortPress).toHaveBeenCalledWith(expect.event('touchend'));
        });

        it('triggers onShortPress after short delay if duration has not passed and pointer is released', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            act(() => fireEvent.touchStart(screen.getByRole('button')));
            act(() => fireEvent.touchEnd(screen.getByRole('button')));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).toHaveBeenCalledWith(expect.event('touchend'));
        });

        it('stops long press timer on pointer move', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            act(() => fireEvent.touchStart(screen.getByRole('button'), { touches: [{ clientX: 0, clientY: 0 }] }));
            act(() => fireEvent.touchMove(screen.getByRole('button'), { touches: [{ clientX: 100, clientY: 100 }] }));
            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('calls onLongPress if pointer moves less than threshold', () => {
            render(<TestComponent onLongPress={onLongPress} onShortPress={onShortPress} />);

            act(() => fireEvent.touchStart(screen.getByRole('button'), { touches: [{ clientX: 0, clientY: 0 }] }));
            act(() => fireEvent.touchMove(screen.getByRole('button'), { touches: [{ clientX: 5, clientY: 5 }] }));
            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.event('touchstart'));
            expect(onShortPress).not.toHaveBeenCalled();
        });
    });

    describe('pointer events', () => {
        beforeEach(() => {
            window.PointerEvent = window.PointerEvent ?? window.MouseEvent;
        });

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
});
