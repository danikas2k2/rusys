import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { SortableGroup } from '~/client/pages/variants/SortableGroup';
import { SortableGroups } from '~/client/pages/variants/SortableGroups';

jest.mock('~/client/state/variants/useGroupVariants');
jest.mock('~/client/pages/variants/SortableGroup', () => ({
    SortableGroup: jest.fn(jest.requireActual('~/client/pages/variants/SortableGroup').SortableGroup),
}));

describe('<SortableGroups>', () => {
    afterEach(() => jest.clearAllMocks());

    const groups = ['Uogienės', 'Daržovės'];

    // eslint-disable-next-line jest/prefer-ending-with-an-expect
    it('renders with groups', () => {
        render(
            <MockRedux>
                <SortableGroups groups={groups} />
            </MockRedux>
        );

        expect(SortableGroup).toHaveBeenCalledTimes(groups.length);

        for (const group of groups) {
            expect(SortableGroup).toHaveBeenCalledWith(expect.objectContaining({ group }), undefined);
        }
    });

    it('resets active variant when clicking outside the row', async () => {
        render(
            <MockRedux>
                <SortableGroups groups={groups} />
            </MockRedux>
        );
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
