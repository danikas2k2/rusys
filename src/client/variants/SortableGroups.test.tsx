import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SortableGroup } from '~/client/variants/SortableGroup';
import { SortableGroups } from '~/client/variants/SortableGroups';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/filter/useFilter');
jest.mock('~/state/variants/useGroupVariants');
jest.mock('~/client/variants/SortableGroup', () => ({
    SortableGroup: jest.fn(jest.requireActual('~/client/variants/SortableGroup').SortableGroup),
}));

describe('SortableGroups', () => {
    afterEach(() => jest.clearAllMocks());

    const groups = ['Uogienės', 'Daržovės'];

    it('renders with groups', () => {
        render(<SortableGroups groups={groups} />, withReduxState());
        expect(SortableGroup).toHaveBeenCalledTimes(groups.length);
        groups.forEach((group) => {
            expect(SortableGroup).toHaveBeenCalledWith(expect.objectContaining({ group }), {});
        });
    });

    it('resets active variant when clicking outside the row', async () => {
        render(<SortableGroups groups={groups} />, withReduxState());
        const target = screen.getAllByRole('row')[2];
        await userEvent.pointer([
            { target, keys: '[MouseLeft>]', coords: { x: 200 } },
            { target, keys: '[/MouseLeft]', coords: { x: 100 } },
        ]);
        expect(screen.getByRole('group')).toBeInTheDocument();
        await userEvent.click(document.body);
        expect(screen.queryByRole('group')).not.toBeInTheDocument();
    });
});
