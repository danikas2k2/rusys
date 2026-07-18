import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Page } from '~/client/pages/common/Page';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';
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
jest.mock('~/client/state/variants/useDeleteVariant');

describe('<VariantsPage>', () => {
    const deleteVariant = jest.fn();

    beforeEach(() => {
        jest.mocked(useDeleteVariant).mockReturnValue(deleteVariant);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

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

    it('calls deleteVariant with group and variant when onDelete is triggered', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsPage />
                </MockRedux>
            </MockTheme>
        );

        const [{ onDelete }] = jest.mocked(Page).mock.calls[0] as [
            { onDelete?: (v: { group: string; variant: string }) => void },
        ];
        onDelete!({ group: 'G', variant: 'V' });

        expect(deleteVariant).toHaveBeenCalledWith('G', 'V');
    });
});
