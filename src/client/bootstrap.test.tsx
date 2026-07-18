import { screen, waitFor } from '@testing-library/react';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import { App } from '~/client/App';
import { bootstrap } from '~/client/bootstrap';
import { ErrorBoundary } from '~/client/common/ErrorBoundary';
import { getStore } from '~/client/state/store';

jest.mock('react-dom/client', () => {
    const actual = jest.requireActual<typeof import('react-dom/client')>('react-dom/client');
    return {
        createRoot: jest.fn((container: Element, options?: Parameters<typeof actual.createRoot>[1]) =>
            actual.createRoot(container, options)
        ),
    };
});
jest.mock('react-redux', () => ({
    Provider: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('~/client/state/store', () => ({
    getStore: jest.fn(),
}));
jest.mock('~/client/App', () => ({
    App: () => <div>App</div>,
}));
jest.mock('~/client/common/ErrorBoundary', () => ({
    ErrorBoundary: jest.fn(({ children }) => <div role="alertdialog">{children}</div>),
}));

const ErrorBoundaryMock = jest.mocked(ErrorBoundary);
const createRootMock = jest.mocked(createRoot);

describe('bootstrap', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>';
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    it('logs error when #root container is not found', async () => {
        document.body.innerHTML = '';
        bootstrap();

        await waitFor(() => expect(console.error).toHaveBeenCalledWith('No #root container found'));
    });

    it('renders App when #root container is found', async () => {
        bootstrap();

        await waitFor(() => expect(screen.getByText('App')).toBeInTheDocument());
    });

    it('wraps App with ErrorBoundary', async () => {
        bootstrap();

        await expect(screen.findByRole('alertdialog')).resolves.toBeInTheDocument();
        expect(ErrorBoundaryMock).toHaveBeenCalledWith(
            expect.objectContaining({ children: expect.anything() }),
            undefined
        );
    });

    it('calls console.warn from onCaughtError callback', () => {
        jest.spyOn(console, 'warn').mockImplementation();
        bootstrap();

        const [, options] = createRootMock.mock.calls[0];
        const error = new Error('caught');
        const errorInfo = { componentStack: 'stack' } as React.ErrorInfo;
        options!.onCaughtError!(error, errorInfo);

        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('Caught error in React tree'),
            errorInfo
        );
    });

    it('calls console.error from onUncaughtError callback', () => {
        bootstrap();

        const [, options] = createRootMock.mock.calls[0];
        const error = new Error('uncaught');
        const errorInfo = { componentStack: 'stack' } as React.ErrorInfo;
        options!.onUncaughtError!(error, errorInfo);

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Uncaught error in React tree'),
            errorInfo
        );
    });

    it('renders redux Provider with store', async () => {
        const store = {} as Store;
        jest.mocked(getStore).mockReturnValueOnce(store);

        bootstrap();

        await expect(screen.findByText('App')).resolves.toBeInTheDocument();
        expect(Provider).toHaveBeenCalledWith(
            expect.objectContaining({
                store,
                children: expect.element({
                    children: expect.element({
                        children: expect.element({
                            children: expect.element(App),
                        }),
                    }),
                }),
            }),
            undefined
        );
        expect(getStore).toHaveBeenCalledWith();
    });
});
