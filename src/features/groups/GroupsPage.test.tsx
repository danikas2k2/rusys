import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Page } from '~/features/common/Page';
import { GroupsPage } from '~/features/groups/GroupsPage';

vi.mock(import('~/features/common/Page'));
vi.mock(import('~/features/groups/GroupsTable'), (): any => ({
    GroupsTable: vi.fn(() => <div>GroupsTable</div>),
}));
vi.mock(import('~/features/groups/ActiveGroupBox'), (): any => ({
    ActiveGroupBox: () => null,
}));

describe('<GroupsPage>', () => {
    afterEach(() => vi.clearAllMocks());

    it('renders into the document', () => {
        render(
            <MockApp>
                <GroupsPage />
            </MockApp>
        );

        expect(screen.getByText('GroupsTable')).toBeInTheDocument();
    });

    it('does not configure swipe-based deletion on the page', () => {
        render(
            <MockApp>
                <GroupsPage />
            </MockApp>
        );

        const [props] = vi.mocked(Page).mock.calls[0]!;

        expect(props.onDelete).toBeUndefined();
    });
});
