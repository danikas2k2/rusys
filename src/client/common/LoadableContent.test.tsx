import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { LoadableContent } from '~/client/common/LoadableContent';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';

jest.mock('~/client/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));

describe('<LoadableContent>', () => {
    const props = {
        loader: jest.fn(),
        hasData: false,
        children: <div role="main">Content</div>,
    };

    afterEach(() => jest.clearAllMocks());

    it('displays loader on initial state', async () => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);

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
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.LOADING);

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
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.FAILED);

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
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);

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
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);

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
