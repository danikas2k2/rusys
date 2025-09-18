import { render, screen } from '@testing-library/react';
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
});
