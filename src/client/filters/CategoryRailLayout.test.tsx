import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React, { useState } from 'react';

import { CategoryRail } from '~/client/filters/CategoryRail';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { QuickFilterWrapper, useQuickFilter } from '~/client/filters/QuickFilterContext';

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

    it('temporarily selects a category with filtered content, then restores the previous category', async () => {
        function Fixture() {
            const [selected, setSelected] = useState('Uogienės');
            const [, setFilter] = useQuickFilter();
            return (
                <>
                    <button onClick={() => setFilter('avietės')}>Filter</button>
                    <button onClick={() => setFilter('')}>Clear</button>
                    <span aria-label="selected-category">{selected}</span>
                    <CategoryRailLayout
                        groups={[
                            { group: 'Uogienės', order: 0 },
                            { group: 'Uogos', order: 1 },
                        ]}
                        selected={selected}
                        onSelect={setSelected}
                        groupsWithContent={new Set(['Uogos'])}
                    >
                        content
                    </CategoryRailLayout>
                </>
            );
        }

        const user = userEvent.setup();
        render(
            <MockTheme>
                <QuickFilterWrapper>
                    <Fixture />
                </QuickFilterWrapper>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Filter' }));

        expect(screen.getByLabelText('selected-category')).toHaveTextContent('Uogos');

        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(screen.getByLabelText('selected-category')).toHaveTextContent('Uogienės');
    });

    it('does the same for an additional active filter', async () => {
        function Fixture() {
            const [selected, setSelected] = useState('Uogienės');
            const [missingOnly, setMissingOnly] = useState(false);
            return (
                <>
                    <button onClick={() => setMissingOnly(true)}>Missing only</button>
                    <button onClick={() => setMissingOnly(false)}>All products</button>
                    <span aria-label="selected-category">{selected}</span>
                    <CategoryRailLayout
                        groups={[
                            { group: 'Uogienės', order: 0 },
                            { group: 'Uogos', order: 1 },
                        ]}
                        selected={selected}
                        onSelect={setSelected}
                        groupsWithContent={new Set(['Uogos'])}
                        filterActive={missingOnly}
                    >
                        content
                    </CategoryRailLayout>
                </>
            );
        }

        const user = userEvent.setup();
        render(
            <MockTheme>
                <Fixture />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Missing only' }));

        expect(screen.getByLabelText('selected-category')).toHaveTextContent('Uogos');

        await user.click(screen.getByRole('button', { name: 'All products' }));

        expect(screen.getByLabelText('selected-category')).toHaveTextContent('Uogienės');
    });
});
