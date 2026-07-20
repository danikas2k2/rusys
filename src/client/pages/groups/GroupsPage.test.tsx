import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';
import type { Mocked } from 'vitest';

import { Page } from '~/client/pages/common/Page';
import { GroupsPage } from '~/client/pages/groups/GroupsPage';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';

vi.mock(import('~/client/pages/common/Page'));
vi.mock(import('~/client/common/SwipeControls'), (): any => ({
    SwipeControls: vi.fn(() => <div>SwipeControls</div>),
}));
vi.mock(import('~/client/common/SwipeControlsContext'), (): any => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock(import('~/client/pages/groups/GroupsTable'), (): any => ({
    GroupsTable: vi.fn(() => <div>GroupsTable</div>),
}));
vi.mock(import('~/client/pages/groups/ActiveGroupBox'), (): any => ({
    ActiveGroupBox: () => null,
}));
vi.mock(import('~/client/state/groups/useDeleteGroup'));

describe('<GroupsPage>', () => {
    const mockDeleteGroup = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.mocked(useDeleteGroup).mockReturnValue(mockDeleteGroup);
    });

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
        let mockDelete: Mocked<React.ComponentProps<typeof Page>['onDelete']>;
        vi.mocked(Page).mockImplementation(({ onDelete }: React.ComponentProps<typeof Page>) => {
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
