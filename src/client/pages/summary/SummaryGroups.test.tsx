import { render, screen, within } from '@testing-library/react';
import { getSummaryFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { SummaryGroups } from '~/client/pages/summary/SummaryGroups';

jest.mock('~/client/state/years/useYears');

describe('<SummaryGroups>', () => {
    const groups = ['Daržovės', 'Uogienės'];
    const summary = getSummaryFixture();

    it('renders table structure', () => {
        render(
            <MockRedux>
                <SummaryGroups groups={groups} summary={summary} />
            </MockRedux>
        );

        const rows = screen.getAllByRole('row');

        expect(rows).toHaveLength(6);

        expect(within(rows[0]).getByRole('rowheader')).toHaveTextContent('Daržovės');
        expect(within(rows[1]).getAllByRole('cell')).toHaveListWithTextContent(['Agurkai', '.', '1d', '.']);
        expect(within(rows[2]).getAllByRole('cell')).toHaveListWithTextContent(['Kopūstai', '.', '.', '2p']);

        expect(within(rows[3]).getByRole('rowheader')).toHaveTextContent('Uogienės');
        expect(within(rows[4]).getAllByRole('cell')).toHaveListWithTextContent(['Avietės', '.', '.', '2p']);
        expect(within(rows[5]).getAllByRole('cell')).toHaveListWithTextContent(['Braškės', '.', '1d', '.']);
    });
});
