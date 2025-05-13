import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { MockRoute } from '@tests/MockRoute';
import { GroupsPage } from './GroupsPage';

jest.mock('~/client/groups/GroupsTable', () => ({
    GroupsTable: () => <div>GroupsTable</div>,
}));
jest.mock('~/client/toolbar/ToolbarFilter', () => ({
    ToolbarFilter: () => <div>ToolbarFilter</div>,
}));

describe('<GroupsPage>', () => {
    it('renders group table', async () => {
        render(
            <MockRedux>
                <MockRoute>
                    <GroupsPage />
                </MockRoute>
            </MockRedux>
        );

        expect(screen.getByText('GroupsTable')).toBeInTheDocument();
    });

    it('renders toolbar filter', async () => {
        render(
            <MockRedux>
                <MockRoute>
                    <GroupsPage />
                </MockRoute>
            </MockRedux>
        );

        expect(screen.getByText('ToolbarFilter')).toBeInTheDocument();
    });
});
