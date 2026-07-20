import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { LoadableContent } from '~/client/common/LoadableContent';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';

vi.mock(import('~/client/hooks/useLockingLoader'), async () => ({
    ...(await vi.importActual('~/client/hooks/useLockingLoader')),
    useLockingLoader: vi.fn(),
}));

describe('<LoadableContent>', () => {
    const props = {
        loader: vi.fn(),
        hasData: false,
        children: <div role="main">Content</div>,
    };

    afterEach(() => vi.clearAllMocks());

    it('displays loader on initial state', async () => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);

        render(
            <MockTheme>
                <LoadableContent {...props} />
            </MockTheme>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays loader on loading state', async () => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.LOADING);

        render(
            <MockTheme>
                <LoadableContent {...props} />
            </MockTheme>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays error on failed state', async () => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.FAILED);

        render(
            <MockTheme>
                <LoadableContent {...props} />
            </MockTheme>
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays error on complete state with no data', async () => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);

        render(
            <MockTheme>
                <LoadableContent {...props} />
            </MockTheme>
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays content on complete state with data', async () => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);

        render(
            <MockTheme>
                <LoadableContent {...props} hasData />
            </MockTheme>
        );

        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
});
