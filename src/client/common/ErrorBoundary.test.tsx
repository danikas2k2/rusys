import { fireEvent, render, screen } from '@testing-library/react';

import React from 'react';

import { ErrorBoundary } from '~/client/common/ErrorBoundary';
import { MockTheme } from '~/tests/MockTheme';

function Boom(): React.JSX.Element {
    throw new Error('Boom');
}

describe('<ErrorBoundary>', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
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

    it('reloads the page when the action is clicked', () => {
        const reloadSpy = jest.fn();

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
});
