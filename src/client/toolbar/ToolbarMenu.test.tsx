import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { WithOnClose } from '~/client/common/WithOnClose';
import { Links } from '~/client/Links';
import { ToolbarMenu } from '~/client/toolbar/ToolbarMenu';
import { withMany } from '~/tests/withMany';
import { withReduxState } from '~/tests/withReduxState';
import { withRouter } from '~/tests/withRouter';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('~/client/details/dialogs/DetailsBox', () => ({
    DetailsBox: ({ onClose }: WithOnClose) => <button onClick={onClose}>DetailsBox</button>,
}));
jest.mock('~/client/groups/dialogs/GroupBox', () => ({
    GroupBox: ({ onClose }: WithOnClose) => <button onClick={onClose}>GroupBox</button>,
}));
jest.mock('~/client/variants/dialogs/VariantBox', () => ({
    VariantBox: ({ onClose }: WithOnClose) => <button onClick={onClose}>VariantBox</button>,
}));

describe('ToolbarMenu', () => {
    describe('details page', () => {
        it('renders details menu collapsed by default', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.DETAILS]), withReduxState()));

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        });

        it('renders details menu items', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.DETAILS]), withReduxState()));

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

            expect(screen.getByRole('menuitem', { name: 'Add' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'List' }))
                .toBeInTheDocument()
                .toHaveClass('current');
            expect(screen.getByRole('menuitem', { name: 'Statistics' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Groups' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Variants' })).toBeInTheDocument();
        });

        it('renders DetailsBox on click', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.DETAILS]), withReduxState()));

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
            await userEvent.click(screen.getByRole('menuitem', { name: 'Add' }));

            expect(screen.getByText('DetailsBox')).toBeInTheDocument();
        });
    });

    describe('groups page', () => {
        it('renders groups menu collapsed by default', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.GROUPS]), withReduxState()));

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        });

        it('renders groups menu items', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.GROUPS]), withReduxState()));

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

            expect(screen.getByRole('menuitem', { name: 'Add' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'List' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Statistics' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Groups' }))
                .toBeInTheDocument()
                .toHaveClass('current');
            expect(screen.getByRole('menuitem', { name: 'Variants' })).toBeInTheDocument();
        });

        it('renders GroupBox on click', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.GROUPS]), withReduxState()));

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
            await userEvent.click(screen.getByRole('menuitem', { name: 'Add' }));

            expect(screen.getByText('GroupBox')).toBeInTheDocument();
        });
    });

    describe('variants page', () => {
        it('renders variants menu collapsed by default', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.VARIANTS]), withReduxState()));

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        });

        it('renders variants menu items', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.VARIANTS]), withReduxState()));

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

            expect(screen.getByRole('menuitem', { name: 'Add' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'List' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Statistics' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Groups' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Variants' }))
                .toBeInTheDocument()
                .toHaveClass('current');
        });

        it('renders VariantBox on click', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.VARIANTS]), withReduxState()));

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
            await userEvent.click(screen.getByRole('menuitem', { name: 'Add' }));

            expect(screen.getByText('VariantBox')).toBeInTheDocument();
        });
    });

    describe('summary page', () => {
        it('renders details menu collapsed by default', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.SUMMARY]), withReduxState()));

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        });

        it('renders details menu items', async () => {
            render(<ToolbarMenu />, withMany(withRouter([Links.SUMMARY]), withReduxState()));

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

            expect(screen.queryByRole('menuitem', { name: 'Add' })).not.toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'List' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Statistics' }))
                .toBeInTheDocument()
                .toHaveClass('current');
            expect(screen.getByRole('menuitem', { name: 'Groups' })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: 'Variants' })).toBeInTheDocument();
        });
    });
});
