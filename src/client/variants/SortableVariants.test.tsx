import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useActiveRow } from '~/client/common/ActiveRowContext';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';
import { type ActiveVariant } from '~/client/variants/SortableVariant';
import { SortableVariants } from '~/client/variants/SortableVariants';

jest.mock('~/client/common/ActiveRowContext', () => ({
    useActiveRow: jest.fn(() => [null, jest.fn()]),
}));
jest.mock('~/client/state/variants/useReorderVariants', () => ({
    useReorderVariants: jest.fn(),
}));
jest.mock('~/client/utils/getOverlapIndex', () => ({
    getOverlapIndex: jest.fn(() => -1),
}));

describe('<SortableVariants>', () => {
    const group = 'Uogienės';
    const variants = [
        { group, variant: 'p', order: 0 },
        { group, variant: 'd', order: 1, suffix: 'D.' },
    ];
    const activeVariant = {
        group,
        variant: 'd',
        ref: { current: null },
    };
    const setActiveVariant = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders with details', () => {
        render(
            <MockRedux>
                <SortableVariants group={group} variants={variants} />
            </MockRedux>
        );
        const rows = screen.getAllByRole('row');

        expect(rows).toHaveLength(2);
        expect(within(rows[0]).getAllByRole('cell')).toHaveListWithTextContent(['p', '']);
        expect(within(rows[1]).getAllByRole('cell')).toHaveListWithTextContent(['d', 'D.']);
    });

    describe('dragging', () => {
        const reorderVariants = jest.fn();

        beforeEach(() => {
            jest.mocked(useActiveRow<ActiveVariant>).mockReturnValue([activeVariant, setActiveVariant]);
            jest.mocked(useReorderVariants).mockReturnValue(reorderVariants);
        });

        it('does not call reorder on drag start', async () => {
            render(
                <MockRedux>
                    <SortableVariants group={group} variants={variants} />
                </MockRedux>
            );
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });

            expect(reorderVariants).not.toHaveBeenCalled();
        });

        it('does not call reorder on drag stop without position change', async () => {
            render(
                <MockRedux>
                    <SortableVariants group={group} variants={variants} />
                </MockRedux>
            );
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, keys: '[/MouseLeft]' },
            ]);

            expect(reorderVariants).not.toHaveBeenCalled();
        });

        it('does not call reorder on drag when elements does not overlap', async () => {
            render(
                <MockRedux>
                    <SortableVariants group={group} variants={variants} />
                </MockRedux>
            );
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, keys: '[/MouseLeft]' },
            ]);

            expect(reorderVariants).not.toHaveBeenCalled();
        });

        it('calls reorder on drag when elements overlaps', async () => {
            jest.mocked(getOverlapIndex).mockReturnValue(0);
            render(
                <MockRedux>
                    <SortableVariants group={group} variants={variants} />
                </MockRedux>
            );
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 } },
                { target, keys: '[/MouseLeft]' },
            ]);

            expect(reorderVariants).toHaveBeenCalledWith(group, { d: 0, p: 1 });
        });

        it('does not call reorder on drag when elements overlaps with different group', async () => {
            jest.mocked(useActiveRow<ActiveVariant>).mockReturnValue([
                {
                    ...activeVariant,
                    group: 'Daržovės',
                },
                setActiveVariant,
            ]);
            jest.mocked(getOverlapIndex).mockReturnValue(0);
            render(
                <MockRedux>
                    <SortableVariants group={group} variants={variants} />
                </MockRedux>
            );
            const [target] = screen.getAllByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, keys: '[/MouseLeft]' },
            ]);

            expect(reorderVariants).not.toHaveBeenCalled();
        });
    });

    describe('slide controls', () => {
        it('renders rows without controls', () => {
            jest.mocked(useActiveRow<ActiveVariant>).mockReturnValue([undefined, setActiveVariant]);
            render(
                <MockRedux>
                    <SortableVariants group={group} variants={variants} />
                </MockRedux>
            );

            expect(screen.queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
        });

        it('renders active variant row with controls', () => {
            jest.mocked(useActiveRow<ActiveVariant>).mockReturnValue([activeVariant, setActiveVariant]);
            render(
                <MockRedux>
                    <SortableVariants group={group} variants={variants} />
                </MockRedux>
            );
            const rows = screen.getAllByRole('row');

            expect(within(rows[0]).queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
            expect(within(rows[1]).getByRole('group', { name: 'Edit Remove' })).toBeInTheDocument();
        });
    });
});
