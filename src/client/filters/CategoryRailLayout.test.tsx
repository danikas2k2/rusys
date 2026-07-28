import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { CategoryRail } from '~/client/filters/CategoryRail';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';

vi.mock(import('~/client/filters/CategoryRail'), () => ({
    CategoryRail: vi.fn(() => <div>CategoryRail</div>),
}));

describe('<CategoryRailLayout>', () => {
    afterEach(() => vi.clearAllMocks());

    it('renders the category rail', () => {
        render(
            <MockTheme>
                <CategoryRailLayout groupsWithContent={new Set()}>content</CategoryRailLayout>
            </MockTheme>
        );

        expect(screen.getByText('CategoryRail')).toBeInTheDocument();
    });

    it('renders the children content', () => {
        render(
            <MockTheme>
                <CategoryRailLayout groupsWithContent={new Set()}>
                    <div>page content</div>
                </CategoryRailLayout>
            </MockTheme>
        );

        expect(screen.getByText('page content')).toBeInTheDocument();
    });

    it('passes groupsWithContent through to the rail', () => {
        const groupsWithContent = new Set(['Uogienės']);

        render(
            <MockTheme>
                <CategoryRailLayout groupsWithContent={groupsWithContent}>content</CategoryRailLayout>
            </MockTheme>
        );

        expect(vi.mocked(CategoryRail).mock.calls[0]?.[0]).toStrictEqual({ groupsWithContent });
    });
});
