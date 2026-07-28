import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Page } from '~/client/pages/common/Page';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';
import { VariantsPage } from './VariantsPage';

vi.mock(import('~/client/common/SwipeControlsContext'));

// Mock the components
vi.mock(import('~/client/pages/variants/VariantsTable'), () => ({
    VariantsTable: () => <div>VariantsTable</div>,
}));
vi.mock(import('~/client/pages/variants/VariantsCategoryRail'), () => ({
    VariantsCategoryRail: () => <div>VariantsCategoryRail</div>,
}));
vi.mock(import('~/client/pages/variants/ActiveVariantBox'), () => ({
    ActiveVariantBox: () => <div>ActiveVariantBox</div>,
}));
vi.mock(import('~/client/common/SwipeControls'), () => ({
    SwipeControls: () => <div>SwipeControls</div>,
}));
vi.mock(import('~/client/pages/common/ActiveContentOutsideClick'), () => ({
    ActiveContentOutsideClick: () => null,
}));
vi.mock(import('~/client/pages/common/Page'));
vi.mock(import('~/client/state/variants/useDeleteVariant'));

describe('<VariantsPage>', () => {
    const deleteVariant = vi.fn();

    beforeEach(() => {
        vi.mocked(useDeleteVariant).mockReturnValue(deleteVariant);
    });

    afterEach(() => {
        vi.clearAllMocks();
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

    it('renders category rail', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsPage />
                </MockRedux>
            </MockTheme>
        );

        expect(screen.getByText('VariantsCategoryRail')).toBeInTheDocument();
    });

    it('calls deleteVariant with group and variant when onDelete is triggered', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsPage />
                </MockRedux>
            </MockTheme>
        );

        const [{ onDelete }] = vi.mocked(Page).mock.calls[0] as [
            { onDelete?: (v: { group: string; variant: string }) => void },
        ];
        onDelete!({ group: 'G', variant: 'V' });

        expect(deleteVariant).toHaveBeenCalledWith('G', 'V');
    });
});
