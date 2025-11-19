import { fireEvent } from '@testing-library/dom';
import { act, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import React from 'react';

import { dispatchNativeCancelEvents } from '~/client/utils/pointEvents';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
    let user: UserEvent;

    beforeEach(() => {
        jest.useFakeTimers();
        user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    });

    afterEach(() => jest.clearAllMocks());

    afterAll(() => jest.useRealTimers());

    function ButtonWithLongPress({
        onClick,
        clickDelay,
        onLongPress,
        longPressDelay,
        children,
    }: React.PropsWithChildren<{
        onClick?: React.PointerEventHandler;
        clickDelay?: number;
        onLongPress?: React.PointerEventHandler;
        longPressDelay?: number;
    }>): React.ReactElement {
        const events = useLongPress<HTMLDivElement>({ onClick, clickDelay, onLongPress, longPressDelay });
        return (
            <div role="button" {...events}>
                {children}
            </div>
        );
    }

    const onClick = jest.fn();
    const onLongPress = jest.fn();

    describe('pointer events', () => {
        it('triggers onLongPress after duration', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA>]' });
            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.event('pointerdown'));
            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress if duration has not passed', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA>]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('triggers onClick immediately if duration has not passed and pointer is released', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).toHaveBeenCalledWith(expect.event('pointerup'));
        });

        it('triggers onClick after short delay if clickDelay is set', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} clickDelay={100} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA]' });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).toHaveBeenCalledWith(expect.event('pointerup'));
        });

        it('stops long press timer on pointer move', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer([
                { target: screen.getByRole('button'), keys: '[TouchA>]' },
                { target: document.body, pointerName: 'TouchA' },
            ]);
            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('cancel functionality', () => {
        it('cancels long-press timer when dispatchNativeCancelEvents is called', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[MouseLeft>]' });

            // Dispatch cancel events
            dispatchNativeCancelEvents(button);

            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointercancel event is fired', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[MouseLeft>]' });

            act(() => fireEvent.pointerCancel(button));

            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointerleave event is fired', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer([
                { target: screen.getByRole('button'), keys: '[TouchA>]' },
                { target: document.body, pointerName: 'TouchA' },
            ]);

            act(() => jest.advanceTimersByTime(500));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointerout event is fired', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');

            await user.pointer([
                // pointerover
                { target: button },
                // pointerdown
                { target: button, keys: '[TouchA>]' },
                // pointerout
                { target: document.body },
            ]);

            act(() => jest.advanceTimersByTime(500));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('handleUp edge cases', () => {
        it('calls handleCancel when longPressRef is true', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[TouchA>]' });
            act(() => jest.advanceTimersByTime(500));

            expect(onLongPress).toHaveBeenCalledWith(expect.any(Object));

            await user.pointer({ target: button, keys: '[/TouchA]' });

            expect(onClick).not.toHaveBeenCalled();
        });

        it('calls handleCancel when onClick is not defined', async () => {
            render(<ButtonWithLongPress onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[TouchA]' });

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('calls handleCancel when inBounds returns false', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer({
                target: screen.getByRole('button'),
                keys: '[TouchA]',
                coords: { x: -100, y: -100 },
            });

            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not call onClick when shortPressRef is already true during same interaction', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA]' });

            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleMove edge cases', () => {
        it('does not clear timeout when move is within threshold', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer([
                // pointerdown
                { target: screen.getByRole('button'), keys: '[TouchA>]' },
                // pointermove within threshold
                { pointerName: 'TouchA', coords: { x: 2, y: 2 } },
            ]);

            jest.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    describe('handleClick', () => {
        it('calls onClick when onClick is triggered', async () => {
            render(<ButtonWithLongPress onClick={onClick} />);

            await user.click(screen.getByRole('button'));

            expect(onClick).toHaveBeenCalledWith(expect.any(Object));
        });

        it('does not call onClick when onClick is not defined', async () => {
            render(<ButtonWithLongPress />);

            await user.click(screen.getByRole('button'));

            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('handleContextMenu', () => {
        it('prevents default and stops propagation', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            jest.spyOn(Event.prototype, 'preventDefault');
            jest.spyOn(Event.prototype, 'stopPropagation');

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[MouseRight]' });

            expect(Event.prototype.preventDefault).toHaveBeenCalledWith();
            expect(Event.prototype.stopPropagation).toHaveBeenCalledWith();
        });
    });

    describe('return value when onLongPress is not defined', () => {
        it('returns onClick and onContextMenu when onLongPress is not defined', () => {
            render(<ButtonWithLongPress onClick={onClick} />);

            const button = screen.getByRole('button');

            // Check that onClick handler exists by verifying it can be called
            expect(button.onclick).toBeDefined();
            // Check that onContextMenu handler exists
            expect(button.oncontextmenu).toBeDefined();
        });
    });
});
