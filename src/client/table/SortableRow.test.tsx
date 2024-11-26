import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import lodash from 'lodash';
import React from 'react';
import { DragHandle } from '~/client/table/DragHandle';
import { SortableRow, type SortableRowProps } from '~/client/table/SortableRow';

jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
jest.spyOn(lodash, 'defer').mockImplementation((fn) => fn());

describe('SortableRow', () => {
    const handle = <DragHandle />;
    const controls = <button>Controls</button>;
    const children = <div>Content</div>;
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();
    const onDrag = jest.fn();
    const props: SortableRowProps = {
        index: 0,
        handle,
        controls,
        children,
        onDragStart,
        onDragEnd,
        onDrag,
    };

    afterEach(() => jest.clearAllMocks());

    describe('slide controls', () => {
        it('calls drag start handler', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByText('Content');
            await userEvent.pointer([{ target, keys: '[MouseLeft>]', coords: { x: 200 } }]);
            expect(onDragStart).toHaveBeenCalledWith();
        });

        it('calls drag end handler', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByText('Content');
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 200 } },
                { target, keys: '[/MouseLeft]', coords: { x: 100 } },
            ]);
            expect(onDragEnd).toHaveBeenCalledWith();
        });

        it('prevents calling drag handler while sliding', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByText('Content');
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 200 } },
                { target, coords: { x: 150 } },
                { target, keys: '[/MouseLeft]', coords: { x: 100 } },
            ]);
            expect(onDrag).not.toHaveBeenCalled();
        });

        it('slide controls while dragging', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByText('Content');
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 200 } },
                { target, coords: { x: 150 } },
            ]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-50px)' });

            await userEvent.pointer([{ target, coords: { x: 100 } }]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-100px)' });

            await userEvent.pointer([{ target, coords: { x: 50 } }]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-150px)' });
        });

        it('slide controls by full width', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByText('Content');
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 200 } },
                { target, keys: '[/MouseLeft]', coords: { x: 100 } },
            ]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-400px)' });
        });

        it('slide controls back', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByText('Content');
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 200 } },
                { target, keys: '[/MouseLeft]', coords: { x: 100 } },
            ]);
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 100 } },
                { target, keys: '[/MouseLeft]', coords: { x: 150 } },
            ]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: '' });
        });

        it('slide controls back if shifted not enough', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByText('Content');
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 200 } },
                { target, keys: '[/MouseLeft]', coords: { x: 190 } },
            ]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: '' });
        });
    });

    describe('drag the row', () => {
        beforeEach(() => {
            jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
                width: 400,
                height: 40,
                top: 0,
                bottom: 40,
            } as DOMRect);
            jest.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(0);
            jest.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue({
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 400,
                    height: 200,
                    top: 0,
                    bottom: 200,
                } as DOMRect),
            } as unknown as Element);
        });

        it('calls drag start handler', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([{ target, keys: '[MouseLeft>]', coords: { y: 10 } }]);
            expect(onDragStart).toHaveBeenCalled();
        });

        it('calls drag end handler', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, keys: '[/MouseLeft]', coords: { y: 20 } },
            ]);
            expect(onDragEnd).toHaveBeenCalled();
        });

        it('calls drag handler', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, coords: { y: 20 } },
                { target, keys: '[/MouseLeft]', coords: { y: 30 } },
            ]);
            expect(onDrag).toHaveBeenCalledTimes(2);
        });

        it('calls drag handler while dragging', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, coords: { y: 20 } },
                { target, coords: { y: 30 } },
                { target, keys: '[/MouseLeft]', coords: { y: 40 } },
            ]);
            expect(onDrag).toHaveBeenCalledTimes(3);
        });

        it('does not move row on drag start', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([{ target, keys: '[MouseLeft>]', coords: { y: 10 } }]);
            expect(screen.getByRole('row')).toHaveStyle({ transform: '' });
        });

        it('puts row back on drag end', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, keys: '[/MouseLeft]', coords: { y: 20 } },
            ]);
            expect(screen.getByRole('row')).toHaveStyle({ transform: '' });
        });

        it('moves row while dragging', async () => {
            render(<SortableRow {...props} />);

            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, coords: { y: 20 } },
            ]);
            expect(screen.getByRole('row')).toHaveStyle({ transform: 'translateY(10px)' });

            await userEvent.pointer([{ target, coords: { y: 30 } }]);
            expect(screen.getByRole('row')).toHaveStyle({ transform: 'translateY(20px)' });

            await userEvent.pointer([{ target, coords: { y: 40 } }]);
            expect(screen.getByRole('row')).toHaveStyle({ transform: 'translateY(30px)' });
        });

        it('does not move over parent bounds', async () => {
            jest.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(40);
            jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
                width: 400,
                height: 40,
                top: 40,
                bottom: 80,
            } as DOMRect);

            render(<SortableRow {...props} />);

            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, coords: { y: -400 } },
            ]);
            expect(screen.getByRole('row')).toHaveStyle({ transform: 'translateY(-40px)' });
        });

        it('does not move below parent bounds', async () => {
            jest.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(40);
            jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
                width: 400,
                height: 40,
                top: 40,
                bottom: 80,
            } as DOMRect);

            render(<SortableRow {...props} />);

            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, coords: { y: 400 } },
            ]);
            expect(screen.getByRole('row')).toHaveStyle({ transform: 'translateY(120px)' });
        });

        it('does offset recalculation on positive index change', async () => {
            jest.spyOn(HTMLElement.prototype, 'nextElementSibling', 'get').mockReturnValue({
                offsetHeight: 30,
            } as HTMLElement);
            jest.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(40);
            jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
                width: 400,
                height: 40,
                top: 40,
                bottom: 80,
            } as DOMRect);

            const { rerender } = render(<SortableRow {...props} />);

            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, coords: { y: 80 } },
            ]);

            rerender(<SortableRow {...props} index={1} />);
            expect(screen.getByRole('row')).toHaveStyle({ transform: 'translateY(40px)' });
        });

        it('does offset recalculation on negative index change', async () => {
            jest.spyOn(HTMLElement.prototype, 'previousElementSibling', 'get').mockReturnValue({
                offsetHeight: 20,
            } as HTMLElement);
            jest.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(80);
            jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
                width: 400,
                height: 40,
                top: 80,
                bottom: 120,
            } as DOMRect);

            const { rerender } = render(<SortableRow {...props} index={1} />);

            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 90 } },
                { target, coords: { y: 60 } },
            ]);

            rerender(<SortableRow {...props} />);
            expect(screen.getByRole('row')).toHaveStyle({ transform: 'translateY(-10px)' });
        });
    });

    describe('slide vs drag', () => {
        it('does not slide controls while dragging by the handler', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 200 } },
                { target, coords: { x: 150 } },
            ]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: '' });
        });

        it('does not call drag handler while dragging by the content', async () => {
            render(<SortableRow {...props} />);
            const target = screen.getByText('Content');
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, coords: { y: 20 } },
                { target, keys: '[/MouseLeft]', coords: { y: 30 } },
            ]);
            expect(onDrag).not.toHaveBeenCalled();
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip('hide expanded controls when dragging by the handler', async () => {
            render(<SortableRow {...props} />);

            let target = screen.getByText('Content');
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { x: 200 } },
                { target, keys: '[/MouseLeft]', coords: { x: 100 } },
            ]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: 'translateX(-400px)' });

            target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, keys: '[MouseLeft>]', coords: { y: 10 } },
                { target, keys: '[/MouseLeft]', coords: { y: 20 } },
            ]);
            expect(screen.getByRole('button', { name: 'Controls' })).toHaveStyle({ transform: '' });
        });
    });
});
