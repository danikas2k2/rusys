import { screen, waitFor } from '@testing-library/react';
import { expectElement } from '@tests/matchers';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import { App } from '~/client/App';
import { bootstrap } from '~/client/bootstrap';
import { ErrorBoundary } from '~/client/common/ErrorBoundary';
import { getStore } from '~/client/state/store';

vi.mock(import('react-dom/client'), async () => {
    const actual = await vi.importActual<typeof import('react-dom/client')>('react-dom/client'); // eslint-disable-line @typescript-eslint/consistent-type-imports
    return {
        createRoot: vi.fn((container: Element, options?: Parameters<typeof actual.createRoot>[1]) =>
            actual.createRoot(container, options)
        ),
    };
});
vi.mock(import('react-redux'), () => ({
    Provider: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));
vi.mock(import('~/client/state/store'), () => ({
    getStore: vi.fn(),
}));
vi.mock(import('~/client/App'), () => ({
    App: () => <div>App</div>,
}));
vi.mock(import('~/client/common/ErrorBoundary'), () => ({
    ErrorBoundary: vi.fn(({ children }: { children: React.ReactNode }) => <div role="alertdialog">{children}</div>),
}));

const ErrorBoundaryMock = vi.mocked(ErrorBoundary);
const createRootMock = vi.mocked(createRoot);

describe('bootstrap', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>';
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.clearAllMocks();
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
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        bootstrap();

        const [, options] = createRootMock.mock.calls[0];
        const error = new Error('caught');
        const errorInfo = { componentStack: 'stack' };
        options!.onCaughtError!(error, errorInfo);

        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Caught error in React tree'), errorInfo);
    });

    it('calls console.error from onUncaughtError callback', () => {
        bootstrap();

        const [, options] = createRootMock.mock.calls[0];
        const error = new Error('uncaught');
        const errorInfo = { componentStack: 'stack' };
        options!.onUncaughtError!(error, errorInfo);

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Uncaught error in React tree'), errorInfo);
    });

    it('renders redux Provider with store', async () => {
        const store = {} as Store;
        vi.mocked(getStore).mockReturnValueOnce(store);

        bootstrap();

        await expect(screen.findByText('App')).resolves.toBeInTheDocument();
        expect(Provider).toHaveBeenCalledWith(
            expect.objectContaining({
                store,
                children: expectElement({
                    children: expectElement({
                        children: expectElement({
                            children: expectElement({
                                children: expectElement(App),
                            }),
                        }),
                    }),
                }),
            }),
            undefined
        );
        expect(getStore).toHaveBeenCalledWith();
    });
});
