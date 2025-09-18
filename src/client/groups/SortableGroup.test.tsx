import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockActiveRow } from '@tests/MockActiveRow';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { SortableGroup } from '~/client/groups/SortableGroup';

describe('<SortableGroup>', () => {
    afterEach(() => jest.clearAllMocks());

    const group = { group: 'Uogienės', order: 1 };

    it('renders with details', () => {
        render(
            <MockRedux>
                <SortableGroup index={0} group={group} />
            </MockRedux>
        );

        expect(screen.getAllByRole('cell')).toHaveListWithTextContent(['Uogienės', '']);
    });

    describe('dragging', () => {
        const onDragStart = jest.fn();

        it('calls onDragStart on drag start', async () => {
            render(
                <MockRedux>
                    <SortableGroup index={0} group={group} onDragStart={onDragStart} />
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });

            expect(onDragStart).toHaveBeenCalledWith('Uogienės');
        });

        const onDragStop = jest.fn();

        it('calls onDragStop on drag stop', async () => {
            render(
                <MockRedux>
                    <SortableGroup index={0} group={group} onDragStop={onDragStop} />
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, keys: '[/MouseLeft]' },
            ]);

            expect(onDragStop).toHaveBeenCalledWith();
        });

        const onDrag = jest.fn();

        it('calls onDrag on drag', async () => {
            render(
                <MockRedux>
                    <SortableGroup index={0} group={group} onDrag={onDrag} />
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 } },
                { target, keys: '[/MouseLeft]' },
            ]);

            expect(onDrag).toHaveBeenCalledTimes(2);
            expect(onDrag).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        });
    });

    describe('slide controls', () => {
        const setActiveGroup = jest.fn();

        it('renders without controls if not active', async () => {
            render(
                <MockRedux>
                    <MockActiveRow setState={setActiveGroup}>
                        <SortableGroup index={0} group={group} />
                    </MockActiveRow>
                </MockRedux>
            );

            expect(screen.queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
        });

        it('sets active group on drag start', async () => {
            render(
                <MockRedux>
                    <MockActiveRow setState={setActiveGroup}>
                        <SortableGroup index={0} group={group} />
                    </MockActiveRow>
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });

            expect(setActiveGroup).toHaveBeenCalledWith({ group: 'Uogienės', annual: true, ref: expect.any(Object) });
        });

        const activeGroup = { group: 'Uogienės', ref: { current: null } };

        it('renders controls when group is active', () => {
            render(
                <MockRedux>
                    <MockActiveRow state={activeGroup} setState={setActiveGroup}>
                        <SortableGroup index={0} group={group} />
                    </MockActiveRow>
                </MockRedux>
            );

            expect(screen.getByRole('group', { name: 'Edit Remove' })).toBeInTheDocument();
        });

        it('pins row when interacting with controls', async () => {
            render(
                <MockRedux>
                    <MockActiveRow state={activeGroup} setState={setActiveGroup}>
                        <SortableGroup index={0} group={group} />
                    </MockActiveRow>
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

            expect(setActiveGroup).toHaveBeenCalledWith({ ...activeGroup, pinned: true });
        });

        it('unpins row when interacting with control dialog', async () => {
            render(
                <MockRedux>
                    <MockActiveRow state={activeGroup} setState={setActiveGroup}>
                        <SortableGroup index={0} group={group} />
                    </MockActiveRow>
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));

            expect(setActiveGroup).toHaveBeenCalledWith({ ...activeGroup, pinned: false });
        });

        it('hides controls when dragging by handler', async () => {
            render(
                <MockRedux>
                    <MockActiveRow state={activeGroup} setState={setActiveGroup}>
                        <SortableGroup index={0} group={group} />
                    </MockActiveRow>
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, keys: '[MouseLeft>]' });

            expect(setActiveGroup).toHaveBeenCalledWith(undefined);
        });
    });
});
