import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import type { ActiveContent } from '~/client/common/ActiveContentContext';
import { ActiveGroupBox } from '~/client/pages/groups/ActiveGroupBox';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';

vi.mock(import('~/client/state/groups/useDeleteGroup'));

vi.mock(import('~/client/pages/groups/GroupBox'), (): any => ({
    GroupBox: ({ opened, onClose, onAfterClose, onDelete, ...props }: any) =>
        opened ? (
            <dialog open>
                <button onClick={() => onClose?.()}>Close</button>
                <button onClick={() => onAfterClose?.()}>After Close</button>
                <button onClick={() => onDelete?.()}>Remove category</button>
                <div>{props.group}</div>
            </dialog>
        ) : null,
}));

describe('<ActiveGroupBox>', () => {
    const active: ActiveContent = { action: 'update', data: { group: 'Uogienės' } };
    const setActive = vi.fn();
    const deleteGroup = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => vi.mocked(useDeleteGroup).mockReturnValue(deleteGroup));

    afterEach(() => vi.clearAllMocks());

    it('does not render box if not active', () => {
        render(
            <MockApp setActive={setActive}>
                <ActiveGroupBox />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders box if active', () => {
        render(
            <MockApp active={active} setActive={setActive}>
                <ActiveGroupBox />
            </MockApp>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Uogienės')).toBeInTheDocument();
    });

    it('calls setActive with data when onClose is triggered', async () => {
        render(
            <MockApp active={active} setActive={setActive}>
                <ActiveGroupBox />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(setActive).toHaveBeenCalledWith({ data: { group: 'Uogienės' } });
    });

    it('calls setActive without arguments when onAfterClose is triggered', async () => {
        render(
            <MockApp active={active} setActive={setActive}>
                <ActiveGroupBox />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'After Close' }));

        expect(setActive).toHaveBeenCalledWith();
    });

    it('deletes the active category after confirmation', async () => {
        render(
            <MockApp active={active} setActive={setActive}>
                <ActiveGroupBox />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove category' }));
        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(deleteGroup).toHaveBeenCalledWith('Uogienės');
        expect(setActive).toHaveBeenCalledWith({ data: { group: 'Uogienės' } });
    });
});
