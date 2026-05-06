import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { VariantsPage } from './VariantsPage';

jest.mock('~/client/common/SwipeControlsContext');

// Mock the components
jest.mock('~/client/pages/variants/VariantsTable', () => ({
    VariantsTable: () => <div>VariantsTable</div>,
}));
jest.mock('~/client/pages/variants/ActiveVariantBox', () => ({
    ActiveVariantBox: () => <div>ActiveVariantBox</div>,
}));
jest.mock('~/client/toolbar/ToolbarGroupFilter', () => ({
    ToolbarGroupFilter: () => <div>ToolbarGroupFilter</div>,
}));
jest.mock('~/client/common/SwipeControls', () => ({
    SwipeControls: () => <div>SwipeControls</div>,
}));
jest.mock('~/client/pages/common/ActiveContentOutsideClick', () => ({
    ActiveContentOutsideClick: () => null,
}));
jest.mock('~/client/pages/common/Page');

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
