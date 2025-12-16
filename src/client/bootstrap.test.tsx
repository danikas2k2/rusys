import { screen, waitFor } from '@testing-library/react';

import React from 'react';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import { App } from '~/client/App';
import { bootstrap } from '~/client/bootstrap';
import { ErrorBoundary } from '~/client/common/ErrorBoundary';
import { getStore } from '~/client/state/store';

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
