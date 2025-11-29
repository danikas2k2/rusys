import { fireEvent, render, screen } from '@testing-library/react';

import React from 'react';

import { dispatchNativeCancelEvents } from '~/client/utils/pointEvents';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
    beforeEach(() => vi.useFakeTimers());

    afterEach(() => vi.clearAllMocks());

    afterAll(() => vi.useRealTimers());

    function ButtonWithLongPress({
        onClick,
        onLongPress,
        delay,
        children,
    }: React.PropsWithChildren<{
        onClick?: React.PointerEventHandler<HTMLElement>;
        onLongPress?: React.PointerEventHandler<HTMLElement>;
        delay?: number;
    }>): React.ReactElement {
        return (
            <div role="button" {...useLongPress({ onClick, onLongPress, delay })}>
                {children}
            </div>
        );
    }

    const onClick = vi.fn();
    const onLongPress = vi.fn();

    describe('pointer events', () => {
        it('triggers onLongPress after duration', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            vi.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.event('pointerdown'));
            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress if duration has not passed', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('triggers onClick immediately if duration has not passed and pointer is released', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerUp(button, { pointerId: 1, clientX: 0, clientY: 0 });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).toHaveBeenCalledWith(expect.event('pointerup'));
        });

        it('stops long press timer on pointer move', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerMove(button, { pointerId: 1, clientX: 100, clientY: 100 });
            vi.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('cancel functionality', () => {
        it('cancels long-press timer when dispatchNativeCancelEvents is called', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            dispatchNativeCancelEvents(button);
            vi.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointercancel event is fired', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerCancel(button, { pointerId: 1 });
            vi.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointerleave event is fired', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerLeave(button, { pointerId: 1, relatedTarget: document.body });
            vi.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointerout event is fired', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerOver(button, { pointerId: 1 });
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerOut(button, { pointerId: 1, relatedTarget: document.body });
            vi.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('click and long press interaction', () => {
        it('does not trigger onClick when long press was already triggered', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            vi.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.any(Object));

            fireEvent.pointerUp(button, { pointerId: 1, clientX: 0, clientY: 0 });

            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress when only onLongPress is provided', async () => {
            render(<ButtonWithLongPress onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerUp(button, { pointerId: 1, clientX: 0, clientY: 0 });

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('does not trigger onClick when pointer is outside bounds', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: -100, clientY: -100 });
            fireEvent.pointerUp(button, { pointerId: 1, clientX: -100, clientY: -100 });

            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onClick multiple times during same interaction', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerUp(button, { pointerId: 1, clientX: 0, clientY: 0 });

            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('does not trigger onLongPress when click was already triggered', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerUp(button, { pointerId: 1, clientX: 0, clientY: 0 });

            expect(onClick).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
        });
    });

    describe('pointer movement handling', () => {
        it('does not cancel long press when move is within threshold', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerMove(button, { pointerId: 1, clientX: 2, clientY: 2 });
            vi.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledWith(expect.any(Object));
        });

        it('cancels long press when move exceeds threshold', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerMove(button, { pointerId: 1, clientX: 15, clientY: 0 });
            vi.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('cancels long press when move exceeds threshold in y direction', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
            fireEvent.pointerMove(button, { pointerId: 1, clientX: 0, clientY: 15 });
            vi.advanceTimersByTime(500);

            expect(onLongPress).not.toHaveBeenCalled();
        });
    });

    describe('click handler when onLongPress is not defined', () => {
        it('triggers onClick when clicked', async () => {
            render(<ButtonWithLongPress onClick={onClick} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(onClick).toHaveBeenCalledWith(expect.any(Object));
        });

        it('does not trigger onClick when onClick is not defined', async () => {
            render(<ButtonWithLongPress />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('context menu handling', () => {
        it('prevents default and stops propagation', async () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            vi.spyOn(Event.prototype, 'preventDefault');
            vi.spyOn(Event.prototype, 'stopPropagation');

            const button = screen.getByRole('button');
            fireEvent.contextMenu(button);

            expect(Event.prototype.preventDefault).toHaveBeenCalledWith();
            expect(Event.prototype.stopPropagation).toHaveBeenCalledWith();
        });
    });

    describe('event handlers when onLongPress is not defined', () => {
        it('provides onClick and onContextMenu handlers', () => {
            render(<ButtonWithLongPress onClick={onClick} />);

            const button = screen.getByRole('button');

            expect(button.onclick).toBeDefined();
            expect(button.oncontextmenu).toBeDefined();
        });
    });
});
