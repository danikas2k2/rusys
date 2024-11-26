import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';
import { useActiveRow } from '~/client/common/ActiveRowContext';
import { SortableVariants } from '~/client/variants/SortableVariants';
import { useReorderVariants } from '~/state/variants/useReorderVariants';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/client/common/ActiveRowContext', () => ({
    useActiveRow: jest.fn(() => [null, jest.fn()]),
}));
jest.mock('~/state/variants/useReorderVariants', () => ({
    useReorderVariants: jest.fn(),
}));
jest.mock('~/client/utils/getOverlapIndex', () => ({
    getOverlapIndex: jest.fn(() => -1),
}));

describe('SortableVariants', () => {
    const group = 'Uogienės';
    const variants = [
        { group, variant: 'p', order: 0, long: '500 ml.' },
        { group, variant: 'd', order: 1, long: '750 ml.', short: 'D.' },
    ];
    const activeVariant = {
        group,
        variant: 'd',
        ref: { current: null },
    };
    const setActiveVariant = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders with details', () => {
        render(<SortableVariants group={group} variants={variants} />, withReduxState());
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(2);
        expect(within(rows[0]).getAllByRole('cell')).toHaveListWithTextContent(['p', '500 ml.', '']);
        expect(within(rows[1]).getAllByRole('cell')).toHaveListWithTextContent(['d', '750 ml.', 'D.']);
    });

    describe('dragging', () => {
        const reorderVariants = jest.fn();

        beforeEach(() => {
            (useActiveRow as jest.Mock).mockReturnValue([activeVariant, setActiveVariant]);
            (useReorderVariants as jest.Mock).mockReturnValue(reorderVariants);
        });

        it('does not call reorder on drag start', async () => {
            render(<SortableVariants group={group} variants={variants} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });
            expect(reorderVariants).not.toHaveBeenCalled();
        });

        it('does not call reorder on drag stop without position change', async () => {
            render(<SortableVariants group={group} variants={variants} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 0 }, keys: '[/MouseLeft]' },
            ]);
            expect(reorderVariants).not.toHaveBeenCalled();
        });

        it('does not call reorder on drag when elements does not overlap', async () => {
            render(<SortableVariants group={group} variants={variants} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 }, keys: '[/MouseLeft]' },
            ]);
            expect(reorderVariants).not.toHaveBeenCalled();
        });

        it('calls reorder on drag when elements overlaps', async () => {
            (getOverlapIndex as jest.Mock).mockReturnValue(0);
            render(<SortableVariants group={group} variants={variants} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 }, keys: '[/MouseLeft]' },
            ]);
            expect(reorderVariants).toHaveBeenCalledWith(group, { d: 0, p: 1 });
        });

        it('does not call reorder on drag when elements overlaps with different group', async () => {
            (useActiveRow as jest.Mock).mockReturnValue([
                {
                    ...activeVariant,
                    group: 'Daržovės',
                },
                setActiveVariant,
            ]);
            (getOverlapIndex as jest.Mock).mockReturnValue(0);
            render(<SortableVariants group={group} variants={variants} />, withReduxState());
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 }, keys: '[/MouseLeft]' },
            ]);
            expect(reorderVariants).not.toHaveBeenCalled();
        });
    });

    describe('slide controls', () => {
        it('renders rows without controls', () => {
            (useActiveRow as jest.Mock).mockReturnValue([null, setActiveVariant]);
            render(<SortableVariants group={group} variants={variants} />, withReduxState());
            expect(screen.queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
        });

        it('renders active variant row with controls', () => {
            (useActiveRow as jest.Mock).mockReturnValue([activeVariant, setActiveVariant]);
            render(<SortableVariants group={group} variants={variants} />, withReduxState());
            const rows = screen.getAllByRole('row');
            expect(within(rows[0]).queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
            expect(within(rows[1]).getByRole('group', { name: 'Edit Remove' })).toBeInTheDocument();
        });
    });
});
