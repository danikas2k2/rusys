import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { DetailsPage } from '~/client/pages/details/DetailsPage';
import { DetailsTable } from '~/client/pages/details/DetailsTable';
import { MissingOnlyEffects } from '~/client/pages/details/MissingOnlyEffects';

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

describe('<DetailsPage>', () => {
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
});
