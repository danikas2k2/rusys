import { fireEvent, render, screen } from '@testing-library/react';

import React from 'react';

import { ErrorBoundary, reloadPage } from '~/client/common/ErrorBoundary';
import { MockTheme } from '~/tests/MockTheme';

function Boom(): React.JSX.Element {
    throw new Error('Boom');
}

function BoomString(): React.JSX.Element {
    throw 'string error' as unknown; // eslint-disable-line no-throw-literal
}

describe('<ErrorBoundary>', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders children when no error occurs', () => {
        render(
            <MockTheme>
                <ErrorBoundary>
                    <div>Child content</div>
                </ErrorBoundary>
            </MockTheme>
        );

        expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('shows fallback when a child throws', () => {
        render(
            <MockTheme>
                <ErrorBoundary>
                    <Boom />
                </ErrorBoundary>
            </MockTheme>
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Unexpected error occurred');
    });

    it('calls onReload prop when the Reload page button is clicked', () => {
        const reloadSpy = vi.fn();

        render(
            <MockTheme>
                <ErrorBoundary onReload={reloadSpy}>
                    <Boom />
                </ErrorBoundary>
            </MockTheme>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Reload page' }));

        expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('clicking Reload page without onReload prop does not throw', () => {
        // No onReload prop — the fallback branch uses reloadPage (globalThis.location.reload)
        // jsdom provides a no-op location.reload, so we verify the click does not throw
        render(
            <MockTheme>
                <ErrorBoundary>
                    <Boom />
                </ErrorBoundary>
            </MockTheme>
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Unexpected error occurred');

        expect(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Reload page' }));
        }).not.toThrow();
    });

    it('logs non-Error thrown values using String() in console.error', () => {
        render(
            <MockTheme>
                <ErrorBoundary>
                    <BoomString />
                </ErrorBoundary>
            </MockTheme>
        );

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('string error'), expect.anything());
    });

    it('reloadPage does not throw when called', () => {
        // reloadPage calls globalThis.location.reload(); jsdom no-ops this call
        expect(() => reloadPage()).not.toThrow();
    });
});
