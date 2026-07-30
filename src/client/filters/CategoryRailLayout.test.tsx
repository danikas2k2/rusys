import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { CategoryRail } from '~/client/filters/CategoryRail';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';

vi.mock(import('~/client/filters/CategoryRail'), () => ({
    CategoryRail: vi.fn(() => <div>CategoryRail</div>),
}));

describe('<CategoryRailLayout>', () => {
    const groups = [{ group: 'Uogienės', order: 0 }];

    afterEach(() => vi.clearAllMocks());

    it('renders the category rail', () => {
        render(
            <MockTheme>
                <CategoryRailLayout
                    groups={groups}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set()}
                >
                    content
                </CategoryRailLayout>
            </MockTheme>
        );

        expect(screen.getByText('CategoryRail')).toBeInTheDocument();
    });

    it('renders the children content', () => {
        render(
            <MockTheme>
                <CategoryRailLayout
                    groups={groups}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set()}
                >
                    <div>page content</div>
                </CategoryRailLayout>
            </MockTheme>
        );

        expect(screen.getByText('page content')).toBeInTheDocument();
    });

    it('passes groups, selected, onSelect and groupsWithContent through to the rail', () => {
        const groupsWithContent = new Set(['Uogienės']);
        const onSelect = vi.fn();

        render(
            <MockTheme>
                <CategoryRailLayout
                    groups={groups}
                    selected="Uogienės"
                    onSelect={onSelect}
                    groupsWithContent={groupsWithContent}
                >
                    content
                </CategoryRailLayout>
            </MockTheme>
        );

        expect(vi.mocked(CategoryRail).mock.calls[0]?.[0]).toStrictEqual({
            groups,
            selected: 'Uogienės',
            onSelect,
            groupsWithContent,
        });
    });
});
