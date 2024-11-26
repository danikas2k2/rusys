import { render, screen } from '@testing-library/react';
import React from 'react';
import { LoadingContent } from '~/client/common/LoadingContent';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';

jest.mock('~/client/common/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/common/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));

describe('LoadingContent', () => {
    const props = {
        loader: jest.fn(),
        hasData: false,
        children: <div role="main">Content</div>,
    };

    afterEach(() => jest.clearAllMocks());

    it('displays loader on initial state', async () => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.INITIAL);
        render(<LoadingContent {...props} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays loader on loading state', async () => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.LOADING);
        render(<LoadingContent {...props} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays error on failed state', async () => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.FAILED);
        render(<LoadingContent {...props} />);
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays error on complete state with no data', async () => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
        render(<LoadingContent {...props} />);
        expect(screen.getByRole('alert')).toHaveTextContent('No data');
        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays content on complete state with data', async () => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
        render(<LoadingContent {...props} hasData />);
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
