import { render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockRoute } from '@tests/MockRoute';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { Links } from '~/client/Links';
import { ToolbarMenu } from '~/client/toolbar/ToolbarMenu';

jest.mock('~/client/hooks/useLabel', () => ({
    useLabel: jest.fn((key: string) => key),
}));
jest.mock('~/client/toolbar/items/ExportMenuItem', () => ({
    ExportMenuItem: jest.fn(() => (
        <div>
            <a href="#export">Export</a>
        </div>
    )),
}));
jest.mock('~/client/toolbar/items/ImportMenuItem', () => ({
    ImportMenuItem: jest.fn(() => (
        <div>
            <a href="#import">Import</a>
        </div>
    )),
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

        expect(menu.getAllByRole('link')).toHaveLength(5);
        expect(menu.getByRole('link', { name: 'Products' })).toBeInTheDocument();
        expect(menu.getByRole('link', { name: 'Summary' })).toBeInTheDocument();
        expect(menu.getByRole('link', { name: 'Groups' })).toBeInTheDocument();
        expect(menu.getByRole('link', { name: 'Variants' })).toBeInTheDocument();
        expect(menu.getByRole('link', { name: 'Utilities' })).toBeInTheDocument();

        expect(menu.getByRole('radiogroup')).toBeInTheDocument();
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
        link              | item
        ${Links.PRODUCTS} | ${'Products'}
        ${Links.SUMMARY}  | ${'Summary'}
        ${Links.GROUPS}   | ${'Groups'}
        ${Links.VARIANTS} | ${'Variants'}
    `('renders $item menu item being active', async ({ link, item }) => {
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

        expect(active).toHaveLength(1).toHaveListWithTextContent([item]);
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
