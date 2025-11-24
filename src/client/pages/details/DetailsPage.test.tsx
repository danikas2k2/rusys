import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Page } from '~/client/pages/common/Page';
import { DetailsPage } from '~/client/pages/details/DetailsPage';
import { DetailsTable } from '~/client/pages/details/DetailsTable';
import { MissingOnlyEffects } from '~/client/pages/details/MissingOnlyEffects';
import { useDeleteDetails } from '~/client/state/details/useDeleteDetails';

jest.mock('~/client/pages/details/DetailsTable', () => ({
    DetailsTable: jest.fn(() => <div>DetailsTable</div>),
}));
jest.mock('~/client/pages/details/MissingOnlyEffects', () => ({
    MissingOnlyEffects: jest.fn(() => null),
}));
jest.mock('~/client/pages/common/Page');
jest.mock('~/client/common/SwipeControls', () => ({
    SwipeControls: () => null,
}));
jest.mock('~/client/common/SwipeControlsContext', () => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/pages/details/ActiveDetailsBox', () => ({
    ActiveDetailsBox: () => null,
}));
jest.mock('~/client/pages/details/ActiveValueBox', () => ({
    ActiveValueBox: () => null,
}));
jest.mock('~/client/filters/GroupFilterContext', () => ({
    GroupFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/filters/QuickFilterContext', () => ({
    QuickFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/toolbar/ToolbarGroupFilter', () => ({
    ToolbarGroupFilter: () => null,
}));
jest.mock('~/client/pages/details/MissingOnlyContext', () => ({
    MissingOnlyWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/pages/details/UpdatingDetailsContext', () => ({
    UpdatingDetailsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/state/details/useDeleteDetails');

describe('<DetailsPage>', () => {
    const mockDeleteDetails = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => jest.mocked(useDeleteDetails).mockReturnValue(mockDeleteDetails));

    afterEach(() => jest.clearAllMocks());

    it('renders into the document', () => {
        render(
            <MockApp>
                <DetailsPage />
            </MockApp>
        );

        expect(screen.getByText('DetailsTable')).toBeInTheDocument();
        expect(DetailsTable).toHaveBeenCalledWith({}, undefined);
        expect(MissingOnlyEffects).toHaveBeenCalledWith({}, undefined);
    });

    it('calls deleteDetails when handleDelete is called', async () => {
        let mockDelete: jest.Mocked<React.ComponentProps<typeof Page>['onDelete']>;
        jest.mocked(Page).mockImplementation(({ onDelete }) => {
            mockDelete = onDelete;
            return <div>Page</div>;
        });

        render(
            <MockApp>
                <DetailsPage />
            </MockApp>
        );

        expect(Page).toHaveBeenCalledWith(
            expect.objectContaining({
                onDelete: expect.any(Function),
            }),
            undefined
        );

        await mockDelete!({ group: 'Uogienės', name: 'Avietės', years: [] });

        expect(mockDeleteDetails).toHaveBeenCalledWith('Uogienės', 'Avietės');
    });
});
