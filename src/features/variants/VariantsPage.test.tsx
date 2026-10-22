import { render, screen } from '@testing-library/react';
import { MockData } from '@tests/MockData';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Page } from '~/features/common/Page';
import { VariantsPage } from './VariantsPage';

// Mock the components
vi.mock(import('~/features/variants/VariantsTable'), () => ({
    VariantsTable: () => <div>VariantsTable</div>,
}));
vi.mock(import('~/features/filters/CategoryRailLayout'), () => ({
    CategoryRailLayout: ({ children }: React.PropsWithChildren) => (
        <div>
            CategoryRailLayout
            {children}
        </div>
    ),
}));
vi.mock(import('~/features/variants/ActiveVariantBox'), () => ({
    ActiveVariantBox: () => <div>ActiveVariantBox</div>,
}));
vi.mock(import('~/features/common/ActiveContentOutsideClick'), () => ({
    ActiveContentOutsideClick: () => null,
}));
vi.mock(import('~/features/common/Page'));

describe('<VariantsPage>', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders variant table', () => {
        render(
            <MockTheme>
                <MockData>
                    <VariantsPage />
                </MockData>
            </MockTheme>
        );

        expect(screen.getByText('VariantsTable')).toBeInTheDocument();
    });

    it('renders category rail layout', () => {
        render(
            <MockTheme>
                <MockData>
                    <VariantsPage />
                </MockData>
            </MockTheme>
        );

        expect(screen.getByText('CategoryRailLayout')).toBeInTheDocument();
    });

    it('does not configure swipe-based deletion on the page', () => {
        render(
            <MockTheme>
                <MockData>
                    <VariantsPage />
                </MockData>
            </MockTheme>
        );

        const [props] = vi.mocked(Page).mock.calls[0]!;

        expect(props.onDelete).toBeUndefined();
    });
});
