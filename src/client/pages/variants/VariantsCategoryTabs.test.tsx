import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { VariantsCategoryTabs } from '~/client/pages/variants/VariantsCategoryTabs';

vi.mock(import('~/client/pages/groups/hooks/useSortedGroups'), () => ({
    useSortedGroups: vi.fn(),
}));
vi.mock(import('~/client/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));

describe('<VariantsCategoryTabs>', () => {
    afterEach(() => vi.clearAllMocks());

    it('renders nothing when there are no categories', () => {
        vi.mocked(useSortedGroups).mockReturnValue([]);
        vi.mocked(useGroupFilter).mockReturnValue(['', vi.fn()]);

        const { container } = render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders a tab per category', () => {
        vi.mocked(useSortedGroups).mockReturnValue([
            { group: 'Uogienės', order: 0 },
            { group: 'Daržovės', order: 1 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        const tabs = screen.getAllByRole('tab');

        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveAccessibleName('Uogienės');
        expect(tabs[1]).toHaveAccessibleName('Daržovės');
    });

    it('marks the selected category as checked', () => {
        vi.mocked(useSortedGroups).mockReturnValue([
            { group: 'Daržovės', order: 0 },
            { group: 'Uogienės', order: 1 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        expect(screen.getByRole('tab', { name: 'Uogienės' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: 'Daržovės' })).not.toHaveAttribute('aria-selected', 'true');
    });

    it('selects the first category by order when none is selected yet', () => {
        const setSelected = vi.fn();

        vi.mocked(useSortedGroups).mockReturnValue([
            { group: 'Uogienės', order: 0 },
            { group: 'Daržovės', order: 1 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['', setSelected]);

        render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        expect(setSelected).toHaveBeenCalledWith('Uogienės');
    });

    it('selects the first category by order when the selected one no longer exists', () => {
        const setSelected = vi.fn();

        vi.mocked(useSortedGroups).mockReturnValue([{ group: 'Uogienės', order: 0 }]);
        vi.mocked(useGroupFilter).mockReturnValue(['Deleted category', setSelected]);

        render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        expect(setSelected).toHaveBeenCalledWith('Uogienės');
    });

    it('does not change the selection when the selected category still exists', () => {
        const setSelected = vi.fn();

        vi.mocked(useSortedGroups).mockReturnValue([
            { group: 'Daržovės', order: 0 },
            { group: 'Uogienės', order: 1 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', setSelected]);

        render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        expect(setSelected).not.toHaveBeenCalled();
    });

    it('calls setSelected with the clicked category', async () => {
        const setSelected = vi.fn();

        vi.mocked(useSortedGroups).mockReturnValue([
            { group: 'Daržovės', order: 0 },
            { group: 'Uogienės', order: 1 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', setSelected]);

        render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        await user.click(screen.getByRole('tab', { name: 'Daržovės' }));

        expect(setSelected).toHaveBeenCalledWith('Daržovės');
    });

    it('renders an avatar with the category image when set', () => {
        vi.mocked(useSortedGroups).mockReturnValue([
            { group: 'Uogienės', order: 0, image: '/images/ab/cd/uogienes.png' },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        const img = document.querySelector('img');

        expect(img).toHaveAttribute('src', '/images/ab/cd/uogienes.png');
    });

    it('renders a first-letter fallback when the category has no image', () => {
        vi.mocked(useSortedGroups).mockReturnValue([{ group: 'Uogienės', order: 0 }]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockTheme>
                <VariantsCategoryTabs />
            </MockTheme>
        );

        expect(screen.getByText('U')).toBeInTheDocument();
    });
});
