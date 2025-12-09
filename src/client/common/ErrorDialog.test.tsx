import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';
import { useDispatch } from 'react-redux';

import { ErrorDialog } from '~/client/common/ErrorDialog';
import { clearErrorAction } from '~/client/state/error/actions';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('<ErrorDialog>', () => {
    const user = userEvent.setup();
    const dispatch = jest.fn();

    beforeAll(() => {
        jest.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('does not render when error is null', () => {
        render(
            <MockRedux>
                <MockTheme>
                    <ErrorDialog />
                </MockTheme>
            </MockRedux>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when error is set', () => {
        const state = { error: { error: 'Test error' } };
        render(
            <MockRedux state={state}>
                <MockTheme>
                    <ErrorDialog />
                </MockTheme>
            </MockRedux>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('clears error when dialog is closed', async () => {
        const state = { error: { error: 'Test error' } };
        render(
            <MockRedux state={state}>
                <MockTheme>
                    <ErrorDialog />
                </MockTheme>
            </MockRedux>
        );

        // Mantine Modal closes on ESC key by default
        await user.keyboard('{Escape}');

        expect(dispatch).toHaveBeenCalledWith(clearErrorAction());
    });
});
