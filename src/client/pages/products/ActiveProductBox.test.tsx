import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture } from '@tests/fixtures';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { ActiveProductBox } from '~/client/pages/products/ActiveProductBox';

vi.mock(import('~/client/pages/products/ProductBox'), (): any => ({
    ProductBox: ({ opened, onClose, onAfterClose, ...props }: any) =>
        opened ? (
            <dialog open>
                <button onClick={() => onClose?.()}>Close</button>
                <button onClick={() => onAfterClose?.()}>After Close</button>
                <div>{props.group}</div>
                <div>{props.name}</div>
            </dialog>
        ) : null,
}));

describe('<ActiveProductBox>', () => {
    const active = { action: 'update' as const, data: { group: 'Uogienės', name: 'Avietės' } };
    const setActive = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('does not render box if not active', () => {
        render(
            <MockThemeRedux>
                <MockActiveContent setActive={setActive}>
                    <ActiveProductBox />
                </MockActiveContent>
            </MockThemeRedux>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders ProductBox if action is update', () => {
        render(
            <MockThemeRedux state={{ groups: getGroupsFixture() }}>
                <MockActiveContent active={active} setActive={setActive}>
                    <ActiveProductBox />
                </MockActiveContent>
            </MockThemeRedux>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Uogienės')).toBeInTheDocument();
        expect(screen.getByText('Avietės')).toBeInTheDocument();
    });

    it('calls setActive with data when onClose is triggered', async () => {
        render(
            <MockThemeRedux state={{ groups: getGroupsFixture() }}>
                <MockActiveContent active={active} setActive={setActive}>
                    <ActiveProductBox />
                </MockActiveContent>
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(setActive).toHaveBeenCalledWith({ data: { group: 'Uogienės', name: 'Avietės' } });
    });

    it('calls setActive without arguments when onAfterClose is triggered', async () => {
        render(
            <MockThemeRedux state={{ groups: getGroupsFixture() }}>
                <MockActiveContent active={active} setActive={setActive}>
                    <ActiveProductBox />
                </MockActiveContent>
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'After Close' }));

        expect(setActive).toHaveBeenCalledWith();
    });
});
