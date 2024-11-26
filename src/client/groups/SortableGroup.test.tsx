import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useActiveRow } from '~/client/common/ActiveRowContext';
import { SortableGroup } from '~/client/groups/SortableGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/client/common/ActiveRowContext', () => ({
    useActiveRow: jest.fn(() => [null, jest.fn()]),
}));

describe('SortableGroup', () => {
    afterEach(() => jest.clearAllMocks());

    const group = { group: 'Uogienės', order: 1 };

    it('renders with details', () => {
        render(<SortableGroup index={0} group={group} />);
        expect(screen.getByRole('cell')).toHaveTextContent('Uogienės');
    });

    describe('dragging', () => {
        const onDragStart = jest.fn();

        it('calls onDragStart on drag start', async () => {
            render(<SortableGroup index={0} group={group} onDragStart={onDragStart} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });
            expect(onDragStart).toHaveBeenCalledWith('Uogienės');
        });

        const onDragStop = jest.fn();

        it('calls onDragStop on drag stop', async () => {
            render(<SortableGroup index={0} group={group} onDragStop={onDragStop} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 0 }, keys: '[/MouseLeft]' },
            ]);
            expect(onDragStop).toHaveBeenCalledWith();
        });

        const onDrag = jest.fn();

        it('calls onDrag on drag', async () => {
            render(<SortableGroup index={0} group={group} onDrag={onDrag} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 }, keys: '[/MouseLeft]' },
            ]);
            expect(onDrag).toHaveBeenCalledTimes(2);
            expect(onDrag).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        });
    });

    describe('slide controls', () => {
        const setActiveGroup = jest.fn();

        it('renders without controls if not active', async () => {
            (useActiveRow as jest.Mock).mockReturnValue([null, setActiveGroup]);
            render(<SortableGroup index={0} group={group} />);
            expect(screen.queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
        });

        it('sets active group on drag start', async () => {
            (useActiveRow as jest.Mock).mockReturnValue([null, setActiveGroup]);
            render(<SortableGroup index={0} group={group} />);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });
            expect(setActiveGroup).toHaveBeenCalledWith({ group: 'Uogienės', ref: expect.any(Object) });
        });

        const activeGroup = { group: 'Uogienės', ref: { current: null } };

        it('renders controls when group is active', () => {
            (useActiveRow as jest.Mock).mockReturnValue([activeGroup, setActiveGroup]);
            render(<SortableGroup index={0} group={group} />, withReduxState());
            expect(screen.getByRole('group', { name: 'Edit Remove' })).toBeInTheDocument();
        });

        it('pins row when interacting with controls', async () => {
            (useActiveRow as jest.Mock).mockReturnValue([activeGroup, setActiveGroup]);
            render(<SortableGroup index={0} group={group} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            expect(setActiveGroup).toHaveBeenCalledWith({ ...activeGroup, pinned: true });
        });

        it('unpins row when interacting with control dialog', async () => {
            (useActiveRow as jest.Mock).mockReturnValue([activeGroup, setActiveGroup]);
            render(<SortableGroup index={0} group={group} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(setActiveGroup).toHaveBeenCalledWith({ ...activeGroup, pinned: false });
        });

        it('hides controls when dragging by handler', async () => {
            (useActiveRow as jest.Mock).mockReturnValue([activeGroup, setActiveGroup]);
            render(<SortableGroup index={0} group={group} />, withReduxState());
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, keys: '[MouseLeft>]' });
            expect(setActiveGroup).toHaveBeenCalledWith(undefined);
        });
    });
});
