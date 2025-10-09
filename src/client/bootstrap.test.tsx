import { screen, waitFor } from '@testing-library/react';

import React from 'react';
import { Provider } from 'react-redux';

import { ColorSchemeState } from '@ui/ColorScheme';

import { App } from '~/client/App';
import { bootstrap } from '~/client/bootstrap';
import { getStore } from '~/client/state/store';

jest.mock('react-redux', () => ({
    Provider: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('@ui/ColorScheme', () => ({
    ColorSchemeState: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('~/client/state/store', () => ({
    getStore: jest.fn(),
}));
jest.mock('~/client/App', () => ({
    App: () => <div>App</div>,
}));

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

    it('renders ColorSchemeState wrapper', async () => {
        bootstrap();

        await waitFor(() =>
            expect(ColorSchemeState).toHaveBeenCalledWith(
                expect.objectContaining({
                    children: expect.element(App),
                }),
                undefined
            )
        );
    });

    it('renders redux Provider with store', async () => {
        bootstrap();

        await waitFor(() =>
            expect(Provider).toHaveBeenCalledWith(
                expect.objectContaining({
                    children: expect.element({
                        children: expect.element(App),
                    }),
                }),
                undefined
            )
        );
        await waitFor(() => expect(getStore).toHaveBeenCalledWith());
    });
});
