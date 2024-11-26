import { render, screen } from '@testing-library/react';
import React from 'react';
import { withMany } from '~/tests/withMany';
import { withReduxState } from '~/tests/withReduxState';
import { withRouter } from '~/tests/withRouter';
import { GroupsPage } from './GroupsPage';

jest.mock('~/client/groups/GroupsTable', () => ({
    GroupsTable: () => <div>GroupsTable</div>,
}));
jest.mock('~/client/toolbar/ToolbarFilter', () => ({
    ToolbarFilter: () => <div>ToolbarFilter</div>,
}));

describe('GroupsPage', () => {
    it('renders group table', async () => {
        render(<GroupsPage />, withMany(withRouter(), withReduxState()));
        expect(screen.getByText('GroupsTable')).toBeInTheDocument();
    });

    it('renders toolbar filter', async () => {
        render(<GroupsPage />, withMany(withRouter(), withReduxState()));
        expect(screen.getByText('ToolbarFilter')).toBeInTheDocument();
    });
});
