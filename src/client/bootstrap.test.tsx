import { screen, waitFor } from '@testing-library/react';

import React from 'react';
import { Provider } from 'react-redux';

import { App } from '~/client/App';
import { bootstrap } from '~/client/bootstrap';
import { getStore } from '~/client/state/store';

vi.mock('react-redux', async () => ({
    Provider: vi.fn(({ children }: React.PropsWithChildren) => <div>{children}</div>),
}));
vi.mock('~/client/state/store', async () => ({
    getStore: vi.fn(),
}));
vi.mock('~/client/App', async () => ({
    App: () => <div>App</div>,
}));

describe('bootstrap', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>';
        vi.spyOn(console, 'error').mockImplementation();
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
