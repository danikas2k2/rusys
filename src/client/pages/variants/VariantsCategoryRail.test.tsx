import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { VariantsCategoryRail } from '~/client/pages/variants/VariantsCategoryRail';
import { useGroups } from '~/client/state/groups/useGroups';
import { useVariants } from '~/client/state/variants/useVariants';

vi.mock(import('~/client/state/groups/useGroups'));
vi.mock(import('~/client/state/variants/useVariants'));
vi.mock(import('~/client/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));

describe('<VariantsCategoryRail>', () => {
    beforeEach(() => {
        vi.mocked(useVariants).mockReturnValue([]);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders nothing when there are no categories', () => {
        vi.mocked(useGroups).mockReturnValue([]);
        vi.mocked(useGroupFilter).mockReturnValue(['', vi.fn()]);

        const { container } = render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders a control per category sorted by order', () => {
        vi.mocked(useGroups).mockReturnValue([
            { group: 'Daržovės', order: 1 },
            { group: 'Uogienės', order: 0 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        const tabs = screen.getAllByRole('tab');

        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveAccessibleName('Uogienės');
        expect(tabs[1]).toHaveAccessibleName('Daržovės');
    });

    it('marks the selected category as checked', () => {
        vi.mocked(useGroups).mockReturnValue([
            { group: 'Daržovės', order: 0 },
            { group: 'Uogienės', order: 1 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        expect(screen.getByRole('tab', { name: 'Uogienės' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: 'Daržovės' })).not.toHaveAttribute('aria-selected', 'true');
    });

    it('selects the first category by order when none is selected yet', () => {
        const setSelected = vi.fn();
        vi.mocked(useGroups).mockReturnValue([
            { group: 'Daržovės', order: 1 },
            { group: 'Uogienės', order: 0 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['', setSelected]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        expect(setSelected).toHaveBeenCalledWith('Uogienės');
    });

    it('selects the first category by order when the selected one no longer exists', () => {
        const setSelected = vi.fn();
        vi.mocked(useGroups).mockReturnValue([{ group: 'Uogienės', order: 0 }]);
        vi.mocked(useGroupFilter).mockReturnValue(['Deleted category', setSelected]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        expect(setSelected).toHaveBeenCalledWith('Uogienės');
    });

    it('does not change the selection when the selected category still exists', () => {
        const setSelected = vi.fn();
        vi.mocked(useGroups).mockReturnValue([
            { group: 'Daržovės', order: 0 },
            { group: 'Uogienės', order: 1 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', setSelected]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        expect(setSelected).not.toHaveBeenCalled();
    });

    it('calls setSelected with the clicked category', async () => {
        const setSelected = vi.fn();
        vi.mocked(useGroups).mockReturnValue([
            { group: 'Daržovės', order: 0 },
            { group: 'Uogienės', order: 1 },
        ]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', setSelected]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        await user.click(screen.getByRole('tab', { name: 'Daržovės' }));

        expect(setSelected).toHaveBeenCalledWith('Daržovės');
    });

    it('renders an avatar with the category image when set', () => {
        vi.mocked(useGroups).mockReturnValue([{ group: 'Uogienės', order: 0, image: '/images/ab/cd/uogienes.png' }]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        const img = document.querySelector('img');

        expect(img).toHaveAttribute('src', '/images/ab/cd/uogienes.png');
    });

    it('renders a first-letter fallback when the category has no image', () => {
        vi.mocked(useGroups).mockReturnValue([{ group: 'Uogienės', order: 0 }]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('greys out the avatar for a category with no variants', () => {
        vi.mocked(useGroups).mockReturnValue([{ group: 'Uogienės', order: 0 }]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);
        vi.mocked(useVariants).mockReturnValue([]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        const avatar = screen.getByText('U').closest('.mantine-Avatar-root');

        expect(avatar).toHaveStyle({ filter: 'grayscale(1)', opacity: '0.4' });
    });

    it('does not grey out the avatar for a category with variants', () => {
        vi.mocked(useGroups).mockReturnValue([{ group: 'Uogienės', order: 0 }]);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);
        vi.mocked(useVariants).mockReturnValue([{ group: 'Uogienės', variant: 'p', order: 0 }]);

        render(
            <MockTheme>
                <VariantsCategoryRail />
            </MockTheme>
        );

        const avatar = screen.getByText('U').closest('.mantine-Avatar-root');

        expect(avatar).not.toHaveStyle({ filter: 'grayscale(1)' });
    });
});
