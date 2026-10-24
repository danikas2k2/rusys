import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockRoute } from '@tests/MockRoute';
import { MockThemeData } from '@tests/MockThemeData';

import React from 'react';

import { ToolbarMenu } from '~/components/toolbar/ToolbarMenu';
import { Links } from '~/lib/links';
import { expectNoA11yViolations } from '~/tests/accessibility';

vi.mock(import('~/lib/hooks/useLabel'), () => ({
    useLabel: vi.fn((key: string) => key),
}));
vi.mock(import('~/components/toolbar/items/ExportMenuItem'), () => ({
    ExportMenuItem: vi.fn(() => <a href="/export">Export</a>),
}));
vi.mock(import('~/components/toolbar/items/ImportMenuItem'), () => ({
    ImportMenuItem: vi.fn(() => <a href="/import">Import</a>),
}));

describe('<ToolbarMenu>', () => {
    it('renders menu collapsed by default', () => {
        render(
            <MockThemeData>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <ToolbarMenu />
                </MockRoute>
            </MockThemeData>
        );

        expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
    });

    it('expands menu by click', async () => {
        render(
            <MockThemeData>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <ToolbarMenu />
                </MockRoute>
            </MockThemeData>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument();
    });

    it('collapses menu by second click', async () => {
        render(
            <MockThemeData>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <ToolbarMenu />
                </MockRoute>
            </MockThemeData>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));
        await user.click(screen.getByRole('button', { name: 'Menu' }));

        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('shows the burger above the navigation drawer only while it is open', async () => {
        render(
            <MockThemeData>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <ToolbarMenu />
                </MockRoute>
            </MockThemeData>
        );

        const burgerBox = document.querySelector('.burger') as HTMLElement;

        expect(burgerBox).toHaveStyle({ zIndex: '101' });

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        expect(burgerBox).toHaveStyle({ zIndex: '300' });

        const drawer = screen.getByRole('dialog', { name: 'Menu' });
        await user.click(screen.getByRole('button', { name: 'Menu' }));

        act(() => fireEvent.transitionEnd(drawer));

        await waitFor(() => {
            expect(burgerBox).toHaveStyle({ zIndex: '101' });
        });
    });

    it('renders required menu items', async () => {
        render(
            <MockThemeData>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <MockActiveContent>
                        <ToolbarMenu />
                    </MockActiveContent>
                </MockRoute>
            </MockThemeData>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        const menu = within(screen.getByRole('navigation'));

        expect(menu.getAllByRole('link')).toHaveListWithTextContent([
            'Products',
            'Summary',
            'Variants',
            'Categories',
            'Utilities',
        ]);

        expect(menu.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
        expect(menu.getByRole('switch', { name: 'Switch to Lithuanian' })).toBeInTheDocument();

        await expectNoA11yViolations();
    });

    it('renders utilities menu items', async () => {
        render(
            <MockThemeData>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <MockActiveContent>
                        <ToolbarMenu />
                    </MockActiveContent>
                </MockRoute>
            </MockThemeData>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        const utilities = screen.getByRole('link', { name: 'Utilities' });
        await user.click(utilities);

        expect(utilities).toHaveAttribute('data-expanded', 'true');

        await waitFor(() =>
            expect(within(screen.getByRole('navigation')).findAllByRole('link')).resolves.toHaveLength(7)
        );

        expect(screen.getByRole('link', { name: 'Export' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Import' })).toBeInTheDocument();
    });

    it.each`
        link                | item
        ${Links.PRODUCTS}   | ${'Products'}
        ${Links.SUMMARY}    | ${'Summary'}
        ${Links.CATEGORIES} | ${'Categories'}
        ${Links.VARIANTS}   | ${'Variants'}
    `('renders $item menu item being active', async ({ link, item }: { link: string; item: string }) => {
        render(
            <MockThemeData>
                <MockRoute initialEntries={[link]}>
                    <MockActiveContent>
                        <ToolbarMenu />
                    </MockActiveContent>
                </MockRoute>
            </MockThemeData>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        const menu = within(screen.getByRole('navigation'));
        const links = menu.getAllByRole('link');
        const active = links.filter((l) => l.matches('[data-active]'));

        expect(active).toHaveLength(1);
        expect(active).toHaveListWithTextContent([item]);
    });

    it('keeps search params in navigation links', async () => {
        render(
            <MockThemeData>
                <MockRoute initialEntries={['/?q=apple&g=fruit']}>
                    <MockActiveContent>
                        <ToolbarMenu />
                    </MockActiveContent>
                </MockRoute>
            </MockThemeData>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        const menu = within(screen.getByRole('navigation'));
        const products = menu.getByRole('link', { name: 'Products' });
        const summary = menu.getByRole('link', { name: 'Summary' });

        expect(products).toHaveAttribute('href', expect.stringContaining('?q=apple&g=fruit'));
        expect(summary).toHaveAttribute('href', expect.stringContaining('?q=apple&g=fruit'));
    });
});
