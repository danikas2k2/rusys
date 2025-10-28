import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { GroupsPage } from '~/client/pages/groups/GroupsPage';

jest.mock('~/client/pages/common/Page');
jest.mock('~/client/common/SwipeControls', () => ({
    SwipeControls: jest.fn(() => <div>SwipeControls</div>),
}));
jest.mock('~/client/common/SwipeControlsContext', () => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/filters/QuickFilterContext', () => ({
    QuickFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('~/client/pages/groups/GroupsTable', () => ({
    GroupsTable: jest.fn(() => <div>GroupsTable</div>),
}));
jest.mock('~/client/pages/groups/ActiveGroupBox', () => ({
    ActiveGroupBox: () => null,
}));

describe('<GroupsPage>', () => {
    it('renders into the document', () => {
        render(
            <MockApp>
                <GroupsPage />
            </MockApp>
        );

        expect(screen.getByText('GroupsTable')).toBeInTheDocument();
    });
});
