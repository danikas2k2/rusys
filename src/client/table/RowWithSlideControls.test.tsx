import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import lodash from 'lodash';

import { RowWithSlideControls, type RowWithSlideControlsProps } from '~/client/table/RowWithSlideControls';

describe('<RowWithSlideControls>', () => {
    const controls = <button>Controls</button>;
    const children = <div>Content</div>;
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();
    const onDrag = jest.fn();
    const props: RowWithSlideControlsProps = {
        controls,
        children,
        onDragStart,
        onDragEnd,
        onDrag,
    };

    beforeEach(() => {
        jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
        jest.spyOn(lodash, 'defer').mockImplementation((fn) => fn());
    });

    afterEach(() => jest.clearAllMocks());

    it('calls drag start handler', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([{ target, coords: { x: 200 }, keys: '[MouseLeft>]' }]);

        expect(onDragStart).toHaveBeenCalledWith();
    });

    it('calls drag end handler', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 100 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(onDragEnd).toHaveBeenCalledWith();
    });

    it('calls drag handler', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 150 } },
            { target, coords: { x: 100 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(onDrag).toHaveBeenCalledTimes(2);
    });

    it('calls drag handler while dragging', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 175 } },
            { target, coords: { x: 150 } },
            { target, coords: { x: 125 } },
            { target, coords: { x: 100 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(onDrag).toHaveBeenCalledTimes(4);
    });

    it('slide controls while dragging', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 150 } },
        ]);

        expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-50px)' });

        await userEvent.pointer([{ target, coords: { x: 100 } }]);

        expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-100px)' });

        await userEvent.pointer([{ target, coords: { x: 50 } }]);

        expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-150px)' });
    });

    it('slide controls by full width', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 100 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-400px)' });
    });

    it('slide controls back', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 100 } },
            { target, keys: '[/MouseLeft]' },
        ]);
        await userEvent.pointer([
            { target, coords: { x: 100 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 150 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: '' });
    });

    it('slide controls back if shifted not enough', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 190 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: '' });
    });

    it('prevents context menu event', async () => {
        render(<RowWithSlideControls {...props} />);

        const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true });
        jest.spyOn(contextMenuEvent, 'preventDefault');
        jest.spyOn(contextMenuEvent, 'stopPropagation');
        screen.getByText('Content').dispatchEvent(contextMenuEvent);

        expect(contextMenuEvent.preventDefault).toHaveBeenCalledWith();
        expect(contextMenuEvent.stopPropagation).toHaveBeenCalledWith();
    });

    it('handles drag without controls', async () => {
        render(<RowWithSlideControls {...props} controls={undefined} />);

        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 150 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(onDragStart).toHaveBeenCalledWith();
        expect(onDrag).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith();
    });

    it('does not call drag on small movements below threshold', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 199 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(onDragStart).toHaveBeenCalledWith();
        expect(onDrag).not.toHaveBeenCalled();
        expect(onDragEnd).not.toHaveBeenCalled();
    });

    it('does not call drag on vertical movement preference over horizontal', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');
        await userEvent.pointer([
            { target, coords: { x: 200, y: 100 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 201, y: 150 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(onDragStart).toHaveBeenCalledWith();
        expect(onDrag).not.toHaveBeenCalled();
        expect(onDragEnd).not.toHaveBeenCalled();
    });

    it('does not call drag without sliding when not dragging', async () => {
        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');

        // Simulate mouse move without dragging
        const mouseMoveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            clientX: 150,
            clientY: 100,
        });

        target.dispatchEvent(mouseMoveEvent);

        expect(onDragStart).not.toHaveBeenCalled();
        expect(onDrag).not.toHaveBeenCalled();
        expect(onDragEnd).not.toHaveBeenCalled();
    });

    it('calls drag with width limit when moving too far left', async () => {
        // Mock control width to test width limit
        jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);

        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');

        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 50 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(onDragStart).toHaveBeenCalledWith();
        expect(onDrag).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith();
    });

    it('calls drag with positive movement', async () => {
        // Mock control width
        jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);

        render(<RowWithSlideControls {...props} />);
        const target = screen.getByText('Content');

        await userEvent.pointer([
            { target, coords: { x: 200 }, keys: '[MouseLeft>]' },
            { target, coords: { x: 250 } },
            { target, keys: '[/MouseLeft]' },
        ]);

        expect(onDragStart).toHaveBeenCalledWith();
        expect(onDrag).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith();
    });

    it('starts dragging using touch event', () => {
        render(<RowWithSlideControls {...props} />);

        const target = screen.getByText('Content');
        const touchStartEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            changedTouches: [{ target, clientX: 200, clientY: 100 } as unknown as Touch],
        });

        act(() => {
            target.dispatchEvent(touchStartEvent);
        });

        expect(onDragStart).toHaveBeenCalledWith();
    });

    it('moves during touch drag and prevents default behavior', () => {
        render(<RowWithSlideControls {...props} />);

        const target = screen.getByText('Content');

        const touchStartEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            changedTouches: [{ target, clientX: 200, clientY: 100 } as unknown as Touch],
        });

        act(() => {
            target.dispatchEvent(touchStartEvent);
        });

        jest.mocked(onDrag).mockReturnValue(true);

        const touchMoveEvent = new TouchEvent('touchmove', {
            bubbles: true,
            cancelable: true,
            changedTouches: [{ target, clientX: 250, clientY: 100 } as unknown as Touch],
        });

        jest.spyOn(touchMoveEvent, 'preventDefault');
        jest.spyOn(touchMoveEvent, 'stopPropagation');

        act(() => {
            target.dispatchEvent(touchMoveEvent);
        });

        expect(onDrag).toHaveBeenCalledTimes(1);
        expect(touchMoveEvent.preventDefault).toHaveBeenCalledWith();
        expect(touchMoveEvent.stopPropagation).toHaveBeenCalledWith();
    });
});
