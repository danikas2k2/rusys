import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Page } from '~/client/pages/common/Page';
import { GroupsPage } from '~/client/pages/groups/GroupsPage';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';

jest.mock('~/client/pages/common/Page');
jest.mock('~/client/common/SwipeControls', () => ({
    SwipeControls: jest.fn(() => <div>SwipeControls</div>),
}));
jest.mock('~/client/common/SwipeControlsContext', () => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/pages/groups/GroupsTable', () => ({
    GroupsTable: jest.fn(() => <div>GroupsTable</div>),
}));
jest.mock('~/client/pages/groups/ActiveGroupBox', () => ({
    ActiveGroupBox: () => null,
}));
jest.mock('~/client/state/groups/useDeleteGroup');

describe('<GroupsPage>', () => {
    const mockDeleteGroup = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => jest.mocked(useDeleteGroup).mockReturnValue(mockDeleteGroup));

    afterEach(() => jest.clearAllMocks());

    it('renders into the document', () => {
        render(
            <MockApp>
                <GroupsPage />
            </MockApp>
        );

        expect(screen.getByText('GroupsTable')).toBeInTheDocument();
    });

    it('calls deleteGroup when handleDelete is called', async () => {
        let mockDelete: jest.Mocked<React.ComponentProps<typeof Page>['onDelete']>;
        jest.mocked(Page).mockImplementation(({ onDelete }) => {
            mockDelete = onDelete;
            return <div>Page</div>;
        });

        render(
            <MockApp>
                <GroupsPage />
            </MockApp>
        );

        expect(Page).toHaveBeenCalledWith(
            expect.objectContaining({
                onDelete: expect.any(Function),
            }),
            undefined
        );

        await mockDelete?.({ group: 'Uogienės', order: 0 });

        expect(mockDeleteGroup).toHaveBeenCalledWith('Uogienės');
    });
});
