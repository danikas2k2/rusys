import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';
import { MockRoute } from '@tests/MockRoute';

import React from 'react';

import { Links } from '~/client/Links';
import { ToolbarMenu } from '~/client/toolbar/ToolbarMenu';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('~/client/pages/details/dialogs/DetailsBox', () => ({
    DetailsBox: ({ onClose }: { onClose: () => void }) => <button onClick={onClose}>DetailsBox</button>,
}));
jest.mock('~/client/pages/groups/dialogs/GroupBox', () => ({
    GroupBox: ({ onClose }: { onClose: () => void }) => <button onClick={onClose}>GroupBox</button>,
}));
jest.mock('~/client/pages/variants/dialogs/VariantBox', () => ({
    VariantBox: ({ onClose }: { onClose: () => void }) => <button onClick={onClose}>VariantBox</button>,
}));

describe('<ToolbarMenu>', () => {
    describe('details page', () => {
        it('renders details menu collapsed by default', async () => {
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.DETAILS]}>
                        <ToolbarMenu />
                    </MockRoute>
                </MockRedux>
            );

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        });

        it('renders details menu items', async () => {
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.DETAILS]}>
                        <ToolbarMenu addBox={<div>DetailsBox</div>} />
                    </MockRoute>
                </MockRedux>
            );

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
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.DETAILS]}>
                        <ToolbarMenu addBox={<div>DetailsBox</div>} />
                    </MockRoute>
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
            await userEvent.click(screen.getByRole('menuitem', { name: 'Add' }));

            expect(screen.getByText('DetailsBox')).toBeInTheDocument();
        });
    });

    describe('groups page', () => {
        it('renders groups menu collapsed by default', async () => {
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.GROUPS]}>
                        <ToolbarMenu />
                    </MockRoute>
                </MockRedux>
            );

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        });

        it('renders groups menu items', async () => {
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.GROUPS]}>
                        <ToolbarMenu addBox={<div>GroupBox</div>} />
                    </MockRoute>
                </MockRedux>
            );

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
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.GROUPS]}>
                        <ToolbarMenu addBox={<div>GroupBox</div>} />
                    </MockRoute>
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
            await userEvent.click(screen.getByRole('menuitem', { name: 'Add' }));

            expect(screen.getByText('GroupBox')).toBeInTheDocument();
        });
    });

    describe('variants page', () => {
        it('renders variants menu collapsed by default', async () => {
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.VARIANTS]}>
                        <ToolbarMenu />
                    </MockRoute>
                </MockRedux>
            );

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        });

        it('renders variants menu items', async () => {
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.VARIANTS]}>
                        <ToolbarMenu addBox={<div>VariantBox</div>} />
                    </MockRoute>
                </MockRedux>
            );

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
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.VARIANTS]}>
                        <ToolbarMenu addBox={<div>VariantBox</div>} />
                    </MockRoute>
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
            await userEvent.click(screen.getByRole('menuitem', { name: 'Add' }));

            expect(screen.getByText('VariantBox')).toBeInTheDocument();
        });
    });

    describe('summary page', () => {
        it('renders details menu collapsed by default', async () => {
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.SUMMARY]}>
                        <ToolbarMenu />
                    </MockRoute>
                </MockRedux>
            );

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        });

        it('renders details menu items', async () => {
            render(
                <MockRedux>
                    <MockRoute initialEntries={[Links.SUMMARY]}>
                        <ToolbarMenu />
                    </MockRoute>
                </MockRedux>
            );

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
