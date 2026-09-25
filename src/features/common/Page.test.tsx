import { render, screen } from '@testing-library/react';
import { MockRoute } from '@tests/MockRoute';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Page } from '~/features/common/Page';

vi.mock(import('~/components/toolbar/Toolbar'), () => ({
    Toolbar: vi.fn(({ children }: { children: React.ReactNode }) => <div role="toolbar">{children}</div>),
}));

vi.mock(import('~/features/common/AddAction'), () => ({
    AddAction: vi.fn(({ onClick }: { onClick?: React.MouseEventHandler }) => (
        <button onClick={onClick} aria-label="Add">
            Add
        </button>
    )),
}));

vi.mock(import('~/features/common/ActiveRemoveConfirmation'), () => ({
    ActiveRemoveConfirmation: vi.fn(
        ({ onConfirm: _onConfirm }: { onConfirm?: (data: unknown) => void | Promise<void> }) => (
            <dialog open>Remove</dialog>
        )
    ),
}));

vi.mock(import('~/components/hooks/useSwipeVisible'), () => ({
    useSwipeVisible: vi.fn(() => false),
}));

vi.mock(import('~/features/review/ActiveReviewBox'), () => ({
    ActiveReviewBox: vi.fn(() => null),
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
