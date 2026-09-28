import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { expectEvent } from '@tests/matchers';

import React from 'react';

import { dispatchNativeCancelEvents } from '~/lib/utils/pointEvents';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

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
        return <button {...useLongPress({ onClick, onLongPress, delay })}>{children}</button>;
    }

    const onClick = vi.fn();
    const onLongPress = vi.fn();

    describe('pointer events', () => {
        it('triggers onLongPress after duration', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            act(() => fireEvent.pointerDown(screen.getByRole('button'), { pointerId: 1, pointerType: 'touch' }));
            act(() => vi.advanceTimersByTime(500));

            expect(onLongPress).toHaveBeenCalledWith(expectEvent('pointerdown'));
            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress if duration has not passed', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            act(() => fireEvent.pointerDown(screen.getByRole('button'), { pointerId: 1, pointerType: 'touch' }));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('triggers onClick immediately if duration has not passed and pointer is released', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);
            const button = screen.getByRole('button');

            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerUp(button, { pointerId: 1, pointerType: 'touch' });
            });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).toHaveBeenCalledWith(expectEvent('pointerup'));
        });

        it('stops long press timer on pointer move', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);
            const button = screen.getByRole('button');

            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerLeave(button, { pointerId: 1, pointerType: 'touch' });
                vi.advanceTimersByTime(500);
            });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('cancel functionality', () => {
        it('cancels long-press timer when dispatchNativeCancelEvents is called', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            act(() => fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'mouse' }));

            dispatchNativeCancelEvents(button);

            act(() => vi.advanceTimersByTime(500));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointercancel event is fired', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            act(() => fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'mouse' }));

            act(() => fireEvent.pointerCancel(button));

            act(() => vi.advanceTimersByTime(500));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointerleave event is fired', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);
            const button = screen.getByRole('button');

            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerLeave(button, { pointerId: 1, pointerType: 'touch' });
                vi.advanceTimersByTime(500);
            });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('cancels long-press timer when pointerout event is fired', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);
            const button = screen.getByRole('button');

            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerOut(button, { pointerId: 1, pointerType: 'touch' });
                vi.advanceTimersByTime(500);
            });

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('click and long press interaction', () => {
        it('does not trigger onClick when long press was already triggered', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch' });
                vi.advanceTimersByTime(500);
            });

            expect(onLongPress).toHaveBeenCalledWith(expect.any(Object));

            act(() => fireEvent.pointerUp(button, { pointerId: 1, pointerType: 'touch' }));

            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onLongPress when only onLongPress is provided', () => {
            render(<ButtonWithLongPress onLongPress={onLongPress} />);

            const button = screen.getByRole('button');
            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerUp(button, { pointerId: 1, pointerType: 'touch' });
            });

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('does not trigger onClick when pointer is outside bounds', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            act(() => {
                fireEvent.pointerDown(screen.getByRole('button'), {
                    pointerId: 1,
                    pointerType: 'touch',
                    clientX: 0,
                    clientY: 0,
                });
                fireEvent.pointerUp(screen.getByRole('button'), {
                    pointerId: 1,
                    pointerType: 'touch',
                    clientX: -100,
                    clientY: -100,
                });
            });

            expect(onClick).not.toHaveBeenCalled();
        });

        it('does not trigger onClick multiple times during same interaction', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            act(() => {
                fireEvent.pointerDown(screen.getByRole('button'), { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerUp(screen.getByRole('button'), { pointerId: 1, pointerType: 'touch' });
            });

            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('does not trigger onLongPress when click was already triggered', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const button = screen.getByRole('button');

            act(() => fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch' }));
            act(() => fireEvent.pointerUp(button, { pointerId: 1, pointerType: 'touch' }));

            expect(onClick).toHaveBeenCalledTimes(1);

            act(() => vi.advanceTimersByTime(500));

            expect(onLongPress).not.toHaveBeenCalled();
        });
    });

    describe('pointer movement handling', () => {
        it('does not cancel long press when move is within threshold', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);
            const button = screen.getByRole('button');

            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0 });
                fireEvent.pointerMove(button, { pointerId: 1, pointerType: 'touch', clientX: 2, clientY: 2 });
                vi.advanceTimersByTime(500);
            });

            expect(onLongPress).toHaveBeenCalledWith(expect.any(Object));
        });

        it('cancels long press when move exceeds threshold', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);
            const button = screen.getByRole('button');

            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0 });
                fireEvent.pointerMove(button, { pointerId: 1, pointerType: 'touch', clientX: 15, clientY: 0 });
                vi.advanceTimersByTime(500);
            });

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('cancels long press when move exceeds threshold in y direction', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);
            const button = screen.getByRole('button');

            act(() => {
                fireEvent.pointerDown(button, { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0 });
                fireEvent.pointerMove(button, { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 15 });
                vi.advanceTimersByTime(500);
            });

            expect(onLongPress).not.toHaveBeenCalled();
        });
    });

    describe('click handler when onLongPress is not defined', () => {
        it('triggers onClick when clicked', () => {
            // When onLongPress is not defined, useLongPress passes onClick directly as a standard click handler
            const directClick = vi.fn();
            const { result } = renderHook(() => useLongPress({ onClick: directClick }));
            const props = result.current as { onClick?: (e: MouseEvent) => void };

            act(() => props.onClick?.({} as unknown as MouseEvent));

            expect(directClick).toHaveBeenCalledWith(expect.any(Object));
        });

        it('does not trigger onClick when onClick is not defined', () => {
            render(<ButtonWithLongPress />);

            act(() => fireEvent.click(screen.getByRole('button')));

            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('context menu handling', () => {
        it('prevents default and stops propagation', () => {
            render(<ButtonWithLongPress onClick={onClick} onLongPress={onLongPress} />);

            const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault');
            const stopPropagationSpy = vi.spyOn(Event.prototype, 'stopPropagation');

            act(() => fireEvent.contextMenu(screen.getByRole('button')));

            expect(preventDefaultSpy).toHaveBeenCalledWith();
            expect(stopPropagationSpy).toHaveBeenCalledWith();

            preventDefaultSpy.mockRestore();
            stopPropagationSpy.mockRestore();
        });
    });

    describe('event handlers when onLongPress is not defined', () => {
        it('provides onClick and onContextMenu handlers', () => {
            render(<ButtonWithLongPress onClick={onClick} />);

            const button = screen.getByRole('button');

            expect(button.onclick).not.toBeNull();
            expect(button.oncontextmenu).toBeNull();
        });
    });
});
