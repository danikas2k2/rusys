import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';
import { useDispatch } from 'react-redux';

import { ErrorDialog } from '~/components/common/ErrorDialog';
import { clearErrorAction } from '~/store/error/slice';

vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('<ErrorDialog>', () => {
    let user: UserEvent;
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => {
        vi.clearAllMocks();
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
