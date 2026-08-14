import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Page } from '~/client/pages/common/Page';
import { VariantsPage } from './VariantsPage';

// Mock the components
vi.mock(import('~/client/pages/variants/VariantsTable'), () => ({
    VariantsTable: () => <div>VariantsTable</div>,
}));
vi.mock(import('~/client/filters/CategoryRailLayout'), () => ({
    CategoryRailLayout: ({ children }: React.PropsWithChildren) => (
        <div>
            CategoryRailLayout
            {children}
        </div>
    ),
}));
vi.mock(import('~/client/pages/variants/ActiveVariantBox'), () => ({
    ActiveVariantBox: () => <div>ActiveVariantBox</div>,
}));
vi.mock(import('~/client/pages/common/ActiveContentOutsideClick'), () => ({
    ActiveContentOutsideClick: () => null,
}));
vi.mock(import('~/client/pages/common/Page'));

describe('<VariantsPage>', () => {
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

    it('renders category rail layout', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsPage />
                </MockRedux>
            </MockTheme>
        );

        expect(screen.getByText('CategoryRailLayout')).toBeInTheDocument();
    });

    it('does not configure swipe-based deletion on the page', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsPage />
                </MockRedux>
            </MockTheme>
        );

        const [props] = vi.mocked(Page).mock.calls[0]!;

        expect(props.onDelete).toBeUndefined();
    });
});
