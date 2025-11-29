import { render, screen } from '@testing-library/react';
import { MockRoute } from '@tests/MockRoute';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Page } from '~/client/pages/common/Page';

vi.mock('~/client/toolbar/Toolbar', async () => ({
    Toolbar: vi.fn(({ children }: React.PropsWithChildren) => <div role="toolbar">{children}</div>),
}));

vi.mock('~/client/pages/common/AddAction', async () => ({
    AddAction: vi.fn(({ onClick }: { onClick?: React.MouseEventHandler }) => (
        <button onClick={onClick} aria-label="Add">
            Add
        </button>
    )),
}));

vi.mock('~/client/pages/common/ActiveRemoveConfirmation', async () => ({
    ActiveRemoveConfirmation: vi.fn(
        ({ onConfirm: _onConfirm }: { onConfirm?: (data: unknown) => void | Promise<void> }) => (
            <div role="dialog">Remove</div>
        )
    ),
}));

vi.mock('~/client/common/hooks/useSwipeVisible', async () => ({
    useSwipeVisible: vi.fn(() => false),
}));

describe('<Page>', () => {
    it('renders content and default toolbar', () => {
        render(
            <MockTheme>
                <MockRoute>
                    <Page>content</Page>
                </MockRoute>
            </MockTheme>
        );

        expect(screen.getByText('content')).toBeInTheDocument();
        expect(screen.getByRole('toolbar')).toBeEmptyDOMElement();
    });

    it('renders content and customized toolbar', () => {
        render(
            <MockTheme>
                <MockRoute>
                    <Page toolbar="toolbar">content</Page>
                </MockRoute>
            </MockTheme>
        );

        expect(screen.getByText('content')).toBeInTheDocument();
        expect(screen.getByRole('toolbar')).toHaveTextContent('toolbar');
    });

    it('renders AddAction when withAdd is true', () => {
        render(
            <MockTheme>
                <MockRoute>
                    <Page withAdd>content</Page>
                </MockRoute>
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders ActiveRemoveConfirmation when onDelete is provided', () => {
        const onDelete = vi.fn();

        render(
            <MockTheme>
                <MockRoute>
                    <Page onDelete={onDelete}>content</Page>
                </MockRoute>
            </MockTheme>
        );

        expect(screen.getByRole('dialog')).toHaveTextContent('Remove');
    });
});
