import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Page } from '~/client/pages/common/Page';
import { GroupsPage } from '~/client/pages/groups/GroupsPage';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';

vi.mock('~/client/pages/common/Page');
vi.mock('~/client/common/SwipeControls', async () => ({
    SwipeControls: vi.fn(() => <div>SwipeControls</div>),
}));
vi.mock('~/client/common/SwipeControlsContext', async () => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('~/client/filters/QuickFilterContext', async () => ({
    QuickFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('~/client/pages/groups/GroupsTable', async () => ({
    GroupsTable: vi.fn(() => <div>GroupsTable</div>),
}));
vi.mock('~/client/pages/groups/ActiveGroupBox', async () => ({
    ActiveGroupBox: () => null,
}));
vi.mock('~/client/state/groups/useDeleteGroup');

describe('<GroupsPage>', () => {
    const mockDeleteGroup = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => vi.mocked(useDeleteGroup).mockReturnValue(mockDeleteGroup));

    afterEach(() => vi.clearAllMocks());

    it('renders into the document', () => {
        render(
            <MockApp>
                <GroupsPage />
            </MockApp>
        );

        expect(screen.getByText('GroupsTable')).toBeInTheDocument();
    });

    it('calls deleteGroup when handleDelete is called', async () => {
        let mockDelete: React.ComponentProps<typeof Page>['onDelete'];
        vi.mocked(Page).mockImplementation(({ onDelete }: { onDelete?: (data: unknown) => void }) => {
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
