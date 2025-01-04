import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SortableGroup } from '~/client/groups/SortableGroup';
import { withActiveRowContext } from '~/tests/withActiveRowContext';
import { withMany } from '~/tests/withMany';
import { withReduxState } from '~/tests/withReduxState';

describe('SortableGroup', () => {
    afterEach(() => jest.clearAllMocks());

    const group = { group: 'Uogienės', order: 1 };
    const redux = withReduxState();

    it('renders with details', () => {
        render(<SortableGroup index={0} group={group} />, redux);
        expect(screen.getByRole('cell')).toHaveTextContent('Uogienės');
    });

    describe('dragging', () => {
        const onDragStart = jest.fn();

        it('calls onDragStart on drag start', async () => {
            render(<SortableGroup index={0} group={group} onDragStart={onDragStart} />, redux);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });
            expect(onDragStart).toHaveBeenCalledWith('Uogienės');
        });

        const onDragStop = jest.fn();

        it('calls onDragStop on drag stop', async () => {
            render(<SortableGroup index={0} group={group} onDragStop={onDragStop} />, redux);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 0 }, keys: '[/MouseLeft]' },
            ]);
            expect(onDragStop).toHaveBeenCalledWith();
        });

        const onDrag = jest.fn();

        it('calls onDrag on drag', async () => {
            render(<SortableGroup index={0} group={group} onDrag={onDrag} />, redux);
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
            render(
                <SortableGroup index={0} group={group} />,
                withMany(redux, withActiveRowContext(null, setActiveGroup))
            );
            expect(screen.queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
        });

        it('sets active group on drag start', async () => {
            render(
                <SortableGroup index={0} group={group} />,
                withMany(redux, withActiveRowContext(null, setActiveGroup))
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });
            expect(setActiveGroup).toHaveBeenCalledWith({ group: 'Uogienės', ref: expect.any(Object) });
        });

        const activeGroup = { group: 'Uogienės', ref: { current: null } };

        it('renders controls when group is active', () => {
            render(
                <SortableGroup index={0} group={group} />,
                withMany(redux, withActiveRowContext(activeGroup, setActiveGroup))
            );
            expect(screen.getByRole('group', { name: 'Edit Remove' })).toBeInTheDocument();
        });

        it('pins row when interacting with controls', async () => {
            render(
                <SortableGroup index={0} group={group} />,
                withMany(redux, withActiveRowContext(activeGroup, setActiveGroup))
            );
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            expect(setActiveGroup).toHaveBeenCalledWith({ ...activeGroup, pinned: true });
        });

        it('unpins row when interacting with control dialog', async () => {
            render(
                <SortableGroup index={0} group={group} />,
                withMany(redux, withActiveRowContext(activeGroup, setActiveGroup))
            );
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(setActiveGroup).toHaveBeenCalledWith({ ...activeGroup, pinned: false });
        });

        it('hides controls when dragging by handler', async () => {
            render(
                <SortableGroup index={0} group={group} />,
                withMany(redux, withActiveRowContext(activeGroup, setActiveGroup))
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, keys: '[MouseLeft>]' });
            expect(setActiveGroup).toHaveBeenCalledWith(undefined);
        });
    });
});
