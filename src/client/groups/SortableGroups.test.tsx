import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';
import { useActiveRow } from '~/client/common/ActiveRowContext';
import { SortableGroups } from '~/client/groups/SortableGroups';
import { useReorderGroups } from '~/state/groups/useReorderGroups';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/client/common/ActiveRowContext', () => ({
    useActiveRow: jest.fn(() => [null, jest.fn()]),
}));
jest.mock('~/state/groups/useReorderGroups', () => ({
    useReorderGroups: jest.fn(),
}));
jest.mock('~/client/utils/getOverlapIndex', () => ({
    getOverlapIndex: jest.fn(() => -1),
}));

describe('SortableGroups', () => {
    const setActiveGroup = jest.fn();

    const groups = [
        { group: 'Uogienės', order: 0 },
        { group: 'Daržovės', order: 1 },
    ];
    const activeGroup = {
        group: 'Daržovės',
        ref: { current: null },
    };

    afterEach(() => jest.clearAllMocks());

    it('renders with details', () => {
        render(<SortableGroups groups={groups} />, withReduxState());
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(2);
        expect(within(rows[0]).getByRole('cell')).toHaveTextContent('Uogienės');
        expect(within(rows[1]).getByRole('cell')).toHaveTextContent('Daržovės');
    });

    describe('dragging', () => {
        const reorderGroups = jest.fn();

        beforeEach(() => {
            (useActiveRow as jest.Mock).mockReturnValue([activeGroup, setActiveGroup]);
            (useReorderGroups as jest.Mock).mockReturnValue(reorderGroups);
        });

        it('does not call reorder on drag start', async () => {
            render(<SortableGroups groups={groups} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });
            expect(reorderGroups).not.toHaveBeenCalled();
        });

        it('does not call reorder on drag stop without position change', async () => {
            render(<SortableGroups groups={groups} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 0 }, keys: '[/MouseLeft]' },
            ]);
            expect(reorderGroups).not.toHaveBeenCalled();
        });

        it('does not call reorder on drag when elements does not overlap', async () => {
            render(<SortableGroups groups={groups} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 }, keys: '[/MouseLeft]' },
            ]);
            expect(reorderGroups).not.toHaveBeenCalled();
        });

        it('calls reorder on drag when elements overlaps', async () => {
            (getOverlapIndex as jest.Mock).mockReturnValue(0);
            render(<SortableGroups groups={groups} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 }, keys: '[/MouseLeft]' },
            ]);
            expect(reorderGroups).toHaveBeenCalledWith({ Daržovės: 0, Uogienės: 1 });
        });
    });

    describe('slide controls', () => {
        it('renders rows without controls', () => {
            (useActiveRow as jest.Mock).mockReturnValue([null, setActiveGroup]);
            render(<SortableGroups groups={groups} />, withReduxState());
            expect(screen.queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
        });

        it('renders active group row with controls', () => {
            (useActiveRow as jest.Mock).mockReturnValue([activeGroup, setActiveGroup]);
            render(<SortableGroups groups={groups} />, withReduxState());
            const rows = screen.getAllByRole('row');
            expect(within(rows[0]).queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
            expect(within(rows[1]).getByRole('group', { name: 'Edit Remove' })).toBeInTheDocument();
        });
    });
});
