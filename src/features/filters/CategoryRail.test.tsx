import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React, { startTransition } from 'react';

import { CategoryRail } from '~/features/filters/CategoryRail';
import { supportsClippedViewTransitions } from '~/lib/utils/supportsClippedViewTransitions';

vi.mock(import('react'), async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, startTransition: vi.fn(actual.startTransition) };
});

vi.mock(import('~/lib/utils/supportsClippedViewTransitions'), () => ({
    supportsClippedViewTransitions: vi.fn(),
}));

describe('<CategoryRail>', () => {
    afterEach(() => {
        vi.mocked(startTransition).mockClear();
        vi.mocked(supportsClippedViewTransitions).mockReset();
    });

    it('renders nothing when there are no categories', () => {
        const { container } = render(
            <MockTheme>
                <CategoryRail groups={[]} selected="" onSelect={vi.fn()} groupsWithContent={new Set()} />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders a control per category in the given order', () => {
        render(
            <MockTheme>
                <CategoryRail
                    groups={[
                        { group: 'Uogienės', order: 0 },
                        { group: 'Daržovės', order: 1 },
                    ]}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set(['Uogienės', 'Daržovės'])}
                />
            </MockTheme>
        );

        const tabs = screen.getAllByRole('tab');

        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveAccessibleName('Uogienės');
        expect(tabs[1]).toHaveAccessibleName('Daržovės');
    });

    it('marks the selected category as checked', () => {
        render(
            <MockTheme>
                <CategoryRail
                    groups={[
                        { group: 'Daržovės', order: 0 },
                        { group: 'Uogienės', order: 1 },
                    ]}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set(['Uogienės', 'Daržovės'])}
                />
            </MockTheme>
        );

        expect(screen.getByRole('tab', { name: 'Uogienės' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: 'Daržovės' })).not.toHaveAttribute('aria-selected', 'true');
    });

    it('selects the first category by order when none is selected yet', () => {
        const onSelect = vi.fn();

        render(
            <MockTheme>
                <CategoryRail
                    groups={[
                        { group: 'Uogienės', order: 0 },
                        { group: 'Daržovės', order: 1 },
                    ]}
                    selected=""
                    onSelect={onSelect}
                    groupsWithContent={new Set()}
                />
            </MockTheme>
        );

        expect(onSelect).toHaveBeenCalledWith('Uogienės');
    });

    it('selects the first category by order when the selected one no longer exists', () => {
        const onSelect = vi.fn();

        render(
            <MockTheme>
                <CategoryRail
                    groups={[{ group: 'Uogienės', order: 0 }]}
                    selected="Deleted category"
                    onSelect={onSelect}
                    groupsWithContent={new Set()}
                />
            </MockTheme>
        );

        expect(onSelect).toHaveBeenCalledWith('Uogienės');
    });

    it('does not change the selection when the selected category still exists', () => {
        const onSelect = vi.fn();

        render(
            <MockTheme>
                <CategoryRail
                    groups={[
                        { group: 'Daržovės', order: 0 },
                        { group: 'Uogienės', order: 1 },
                    ]}
                    selected="Uogienės"
                    onSelect={onSelect}
                    groupsWithContent={new Set()}
                />
            </MockTheme>
        );

        expect(onSelect).not.toHaveBeenCalled();
    });

    it('calls onSelect with the clicked category', async () => {
        const onSelect = vi.fn();
        vi.mocked(supportsClippedViewTransitions).mockReturnValue(false);

        render(
            <MockTheme>
                <CategoryRail
                    groups={[
                        { group: 'Daržovės', order: 0 },
                        { group: 'Uogienės', order: 1 },
                    ]}
                    selected="Uogienės"
                    onSelect={onSelect}
                    groupsWithContent={new Set(['Uogienės', 'Daržovės'])}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('tab', { name: 'Daržovės' }));

        expect(onSelect).toHaveBeenCalledWith('Daržovės');
        expect(supportsClippedViewTransitions).toHaveBeenCalledExactlyOnceWith();
        expect(startTransition).not.toHaveBeenCalled();
    });

    it('uses a document transition when clipped transitions are supported', async () => {
        const onSelect = vi.fn();
        vi.mocked(supportsClippedViewTransitions).mockReturnValue(true);

        render(
            <MockTheme>
                <CategoryRail
                    groups={[
                        { group: 'Uogienės', order: 0 },
                        { group: 'Daržovės', order: 1 },
                    ]}
                    selected="Uogienės"
                    onSelect={onSelect}
                    groupsWithContent={new Set(['Uogienės', 'Daržovės'])}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('tab', { name: 'Daržovės' }));

        expect(supportsClippedViewTransitions).toHaveBeenCalledExactlyOnceWith();
        expect(startTransition).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
        expect(onSelect).toHaveBeenCalledWith('Daržovės');
    });

    it('keeps the transition inside the scrollport when requested', async () => {
        const onSelect = vi.fn();
        vi.mocked(supportsClippedViewTransitions).mockReturnValue(true);

        render(
            <MockTheme>
                <CategoryRail
                    groups={[
                        { group: 'Uogienės', order: 0 },
                        { group: 'Daržovės', order: 1 },
                    ]}
                    selected="Uogienės"
                    onSelect={onSelect}
                    groupsWithContent={new Set(['Uogienės', 'Daržovės'])}
                    animateWithinScrollport
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('tab', { name: 'Daržovės' }));

        expect(supportsClippedViewTransitions).not.toHaveBeenCalled();
        expect(startTransition).not.toHaveBeenCalled();
        expect(onSelect).toHaveBeenCalledWith('Daržovės');
    });

    it('renders an avatar with the category image when set', () => {
        render(
            <MockTheme>
                <CategoryRail
                    groups={[{ group: 'Uogienės', order: 0, image: '/images/ab/cd/uogienes.png' }]}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set(['Uogienės'])}
                />
            </MockTheme>
        );

        const img = document.querySelector('img');

        expect(img?.getAttribute('src')).toContain('/images/ab/cd/uogienes.png?w=64');
        expect(img?.getAttribute('srcset')).toContain('/images/ab/cd/uogienes.png?w=32 1x');
    });

    it('renders the category name as a label for wider screens', () => {
        render(
            <MockTheme>
                <CategoryRail
                    groups={[{ group: 'Uogienės', order: 0 }]}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set(['Uogienės'])}
                />
            </MockTheme>
        );

        const label = screen.getByText('Uogienės');

        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('data-category-label');
        expect(label).toHaveAttribute('title', 'Uogienės');
    });

    it('renders a first-letter fallback when the category has no image', () => {
        render(
            <MockTheme>
                <CategoryRail
                    groups={[{ group: 'Uogienės', order: 0 }]}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set(['Uogienės'])}
                />
            </MockTheme>
        );

        expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('greys out the avatar for a category with no content', () => {
        render(
            <MockTheme>
                <CategoryRail
                    groups={[{ group: 'Uogienės', order: 0 }]}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set()}
                />
            </MockTheme>
        );

        const avatar = screen.getByText('U').closest('.mantine-Avatar-root');

        expect(avatar).toHaveAttribute('data-grayed', 'true');
    });

    it('does not grey out the avatar for a category with content', () => {
        render(
            <MockTheme>
                <CategoryRail
                    groups={[{ group: 'Uogienės', order: 0 }]}
                    selected="Uogienės"
                    onSelect={vi.fn()}
                    groupsWithContent={new Set(['Uogienės'])}
                />
            </MockTheme>
        );

        const avatar = screen.getByText('U').closest('.mantine-Avatar-root');

        expect(avatar).toHaveAttribute('data-grayed', 'false');
    });
});
