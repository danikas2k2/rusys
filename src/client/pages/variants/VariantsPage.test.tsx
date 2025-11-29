import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { VariantsPage } from './VariantsPage';

// Mock all the complex context wrappers to avoid issues
vi.mock('~/client/filters/GroupFilterContext', async () => ({
    GroupFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('~/client/filters/QuickFilterContext', async () => ({
    QuickFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('~/client/common/SwipeControlsContext');

// Mock the components
vi.mock('~/client/pages/variants/VariantsTable', async () => ({
    VariantsTable: () => <div>VariantsTable</div>,
}));
vi.mock('~/client/pages/variants/ActiveVariantBox', async () => ({
    ActiveVariantBox: () => <div>ActiveVariantBox</div>,
}));
vi.mock('~/client/toolbar/ToolbarGroupFilter', async () => ({
    ToolbarGroupFilter: () => <div>ToolbarGroupFilter</div>,
}));
vi.mock('~/client/common/SwipeControls', async () => ({
    SwipeControls: () => <div>SwipeControls</div>,
}));
vi.mock('~/client/pages/common/ActiveContentOutsideClick', async () => ({
    ActiveContentOutsideClick: () => null,
}));
vi.mock('~/client/pages/common/Page');

describe('<VariantsPage>', () => {
    it('renders variant table', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsPage />
                </MockRedux>
            </MockTheme>
        );

        expect(screen.getByText('VariantsTable')).toBeInTheDocument();
    });

    it('renders toolbar with group filter', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsPage />
                </MockRedux>
            </MockTheme>
        );

        expect(screen.getByText('ToolbarGroupFilter')).toBeInTheDocument();
    });
});
