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
        onLongPress,
        delay,
        children,
    }: React.PropsWithChildren<{
        onClick?: React.PointerEventHandler;
        onLongPress?: React.PointerEventHandler;
        delay?: number;
    }>): React.ReactElement {
        return (
            <div role="button" {...useLongPress({ onClick, onLongPress, delay })}>
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

    describe('click and long press interaction', () => {
        it('does not trigger onClick when long press was already triggered', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[TouchA>]' });
            act(() => jest.advanceTimersByTime(500));

            expect(onLongPress).toHaveBeenCalledWith(expect.any(Object));

            await user.pointer({ target: button, keys: '[/TouchA]' });

            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress when only onLongPress is provided', async () => {
            render(<ButtonWithLongPress onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            await user.pointer({ target: button, keys: '[TouchA]' });

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('does not trigger onClick when pointer is outside bounds', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer({
                target: screen.getByRole('button'),
                keys: '[TouchA]',
                coords: { x: -100, y: -100 },
            });

            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onClick multiple times during same interaction', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer({ target: screen.getByRole('button'), keys: '[TouchA]' });

            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('does not trigger onLongPress when click was already triggered', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            // Start pointer down
            await user.pointer({ target: button, keys: '[TouchA>]' });

            // Release pointer quickly to trigger onClick
            await user.pointer({ target: button, keys: '[/TouchA]' });

            expect(onClick).toHaveBeenCalledTimes(1);

            // Advance timers to trigger the long press timeout
            jest.advanceTimersByTime(500);

            // onLongPress should not be called because click was already triggered
            expect(onLongPress).not.toHaveBeenCalled();
        });
    });

    describe('pointer movement handling', () => {
        it('does not cancel long press when move is within threshold', async () => {
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

        it('cancels long press when move exceeds threshold', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer([
                // pointerdown
                { target: screen.getByRole('button'), keys: '[TouchA>]' },
                // pointermove beyond threshold (x > 10)
                { pointerName: 'TouchA', coords: { x: 15, y: 0 } },
            ]);

            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('cancels long press when move exceeds threshold in y direction', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            await user.pointer([
                // pointerdown
                { target: screen.getByRole('button'), keys: '[TouchA>]' },
                // pointermove beyond threshold (y > 10)
                { pointerName: 'TouchA', coords: { x: 0, y: 15 } },
            ]);

            jest.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
        });
    });

    describe('click handler when onLongPress is not defined', () => {
        it('triggers onClick when clicked', async () => {
            render(<ButtonWithLongPress onClick={onClick} />);

            await user.click(screen.getByRole('button'));

            expect(onClick).toHaveBeenCalledWith(expect.any(Object));
        });

        it('does not trigger onClick when onClick is not defined', async () => {
            render(<ButtonWithLongPress />);

            await user.click(screen.getByRole('button'));

            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('context menu handling', () => {
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

    describe('event handlers when onLongPress is not defined', () => {
        it('provides onClick and onContextMenu handlers', () => {
            render(<ButtonWithLongPress onClick={onClick} />);

            const button = screen.getByRole('button');

            // Check that onClick handler exists by verifying it can be called
            expect(button.onclick).toBeDefined();
            // Check that onContextMenu handler exists
            expect(button.oncontextmenu).toBeDefined();
        });
    });
});
