import { screen, waitFor } from '@testing-library/react';
import { ColorSchemeState } from '@ui/ColorScheme';
import React from 'react';
import { Provider } from 'react-redux';
import { bootstrap } from '~/client/bootstrap';
import { getStore } from '~/state/store';

jest.mock('react-redux', () => ({
    Provider: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('@ui/ColorScheme', () => ({
    ColorSchemeState: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('~/state/store', () => ({
    getStore: jest.fn(),
}));
jest.mock('~/client/App', () => () => <div>App</div>);

describe('bootstrap', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>';
        console.error = jest.fn();
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
        await waitFor(() => expect(ColorSchemeState).toHaveBeenCalled());
    });

    it('renders redux Provider with store', async () => {
        bootstrap();
        await waitFor(() => expect(Provider).toHaveBeenCalled());
        await waitFor(() => expect(getStore).toHaveBeenCalled());
    });
});
