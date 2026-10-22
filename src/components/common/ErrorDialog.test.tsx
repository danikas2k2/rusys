import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ErrorDialog } from '~/components/common/ErrorDialog';
import { ErrorProvider, useError } from '~/store/error/useError';

function ErrorControls() {
    const setError = useError((state) => state.setError);
    const error = useError((state) => state.error);
    return (
        <>
            <button onClick={() => setError('Test error')}>Show error</button>
            <span data-testid="error-state">{error ?? 'none'}</span>
        </>
    );
}

function TestDialog() {
    return (
        <ErrorProvider>
            <ErrorControls />
            <ErrorDialog />
        </ErrorProvider>
    );
}

describe('<ErrorDialog>', () => {
    it('requires an error provider', () => {
        expect(() => render(<ErrorControls />)).toThrow('useError must be used within ErrorProvider');
    });

    it('does not render when error is null', () => {
        render(
            <MockTheme>
                <TestDialog />
            </MockTheme>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders the current error', async () => {
        render(
            <MockTheme>
                <TestDialog />
            </MockTheme>
        );

        await userEvent.setup().click(screen.getByRole('button', { name: 'Show error' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveTextContent('Something went wrong');
    });

    it('clears error when closed', async () => {
        render(
            <MockTheme>
                <TestDialog />
            </MockTheme>
        );
        await userEvent.setup().click(screen.getByRole('button', { name: 'Show error' }));
        await userEvent.setup().keyboard('{Escape}');

        expect(screen.getByTestId('error-state')).toHaveTextContent('none');
    });

    it('keeps errors isolated between providers', async () => {
        render(
            <MockTheme>
                <TestDialog />
                <TestDialog />
            </MockTheme>
        );

        await userEvent.setup().click(screen.getAllByRole('button', { name: 'Show error' })[0]);

        expect(screen.getAllByTestId('error-state')[0]).toHaveTextContent('Test error');
        expect(screen.getAllByTestId('error-state')[1]).toHaveTextContent('none');
        expect(screen.getAllByRole('dialog')).toHaveLength(1);
    });
});
