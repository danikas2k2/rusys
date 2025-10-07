import { render, screen } from '@testing-library/react';

import React from 'react';

import { LoadingState, useLockingLoader } from '~/client/app/common/hooks/useLockingLoader';
import { LoadingContent } from '~/client/app/common/LoadingContent';

jest.mock('~/client/app/common/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/app/common/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));

describe('<LoadingContent>', () => {
    const props = {
        loader: jest.fn(),
        hasData: false,
        children: <div role="main">Content</div>,
    };

    afterEach(() => jest.clearAllMocks());

    it('displays loader on initial state', async () => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
        render(<LoadingContent {...props} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays loader on loading state', async () => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.LOADING);
        render(<LoadingContent {...props} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays error on failed state', async () => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.FAILED);
        render(<LoadingContent {...props} />);

        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays error on complete state with no data', async () => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        render(<LoadingContent {...props} />);

        expect(screen.getByRole('alert')).toHaveTextContent('No data');
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays content on complete state with data', async () => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        render(<LoadingContent {...props} hasData />);

        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
