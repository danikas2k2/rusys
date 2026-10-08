import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockRoute } from '@tests/MockRoute';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { ToolbarMenu } from '~/components/toolbar/ToolbarMenu';
import { Links } from '~/lib/links';

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
            <MockThemeRedux>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <ToolbarMenu />
                </MockRoute>
            </MockThemeRedux>
        );

        expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
        expect(screen.getByRole('menu')).toBeEmptyDOMElement();
    });

    it('expands menu by click', async () => {
        render(
            <MockThemeRedux>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <ToolbarMenu />
                </MockRoute>
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('collapses menu by second click', async () => {
        render(
            <MockThemeRedux>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <ToolbarMenu />
                </MockRoute>
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));
        await user.click(screen.getByRole('button', { name: 'Menu' }));

        expect(screen.getByRole('menu')).toBeEmptyDOMElement();
    });

    it('shows the burger above the navigation drawer only while it is open', async () => {
        render(
            <MockThemeRedux>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <ToolbarMenu />
                </MockRoute>
            </MockThemeRedux>
        );

        const burgerBox = document.querySelector('.burger') as HTMLElement;

        expect(burgerBox).toHaveStyle({ zIndex: '101' });

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        expect(burgerBox).toHaveStyle({ zIndex: '300' });

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        act(() => fireEvent.transitionEnd(screen.getByRole('menu')));

        await waitFor(() => {
            expect(burgerBox).toHaveStyle({ zIndex: '101' });
        });
    });

    it('renders required menu items', async () => {
        render(
            <MockThemeRedux>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <MockActiveContent>
                        <ToolbarMenu />
                    </MockActiveContent>
                </MockRoute>
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        const menu = within(screen.getByRole('menu'));

        expect(menu.getAllByRole('link')).toHaveListWithTextContent([
            'Products',
            'Summary',
            'Variants',
            'Categories',
            'Utilities',
        ]);

        expect(menu.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
        expect(menu.getByRole('switch', { name: 'Switch to Lithuanian' })).toBeInTheDocument();
    });

    it('renders utilities menu items', async () => {
        render(
            <MockThemeRedux>
                <MockRoute initialEntries={[Links.PRODUCTS]}>
                    <MockActiveContent>
                        <ToolbarMenu />
                    </MockActiveContent>
                </MockRoute>
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        const utilities = screen.getByRole('link', { name: 'Utilities' });
        await user.click(utilities);

        expect(utilities).toHaveAttribute('data-expanded', 'true');

        await waitFor(() => expect(within(screen.getByRole('menu')).findAllByRole('link')).resolves.toHaveLength(7));

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
            <MockThemeRedux>
                <MockRoute initialEntries={[link]}>
                    <MockActiveContent>
                        <ToolbarMenu />
                    </MockActiveContent>
                </MockRoute>
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        const menu = within(screen.getByRole('menu'));
        const links = menu.getAllByRole('link');
        const active = links.filter((l) => l.matches('[data-active]'));

        expect(active).toHaveLength(1);
        expect(active).toHaveListWithTextContent([item]);
    });

    it('keeps search params in navigation links', async () => {
        render(
            <MockThemeRedux>
                <MockRoute initialEntries={['/?q=apple&g=fruit']}>
                    <MockActiveContent>
                        <ToolbarMenu />
                    </MockActiveContent>
                </MockRoute>
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Menu' }));

        const menu = within(screen.getByRole('menu'));
        const products = menu.getByRole('link', { name: 'Products' });
        const summary = menu.getByRole('link', { name: 'Summary' });

        expect(products).toHaveAttribute('href', expect.stringContaining('?q=apple&g=fruit'));
        expect(summary).toHaveAttribute('href', expect.stringContaining('?q=apple&g=fruit'));
    });
});
