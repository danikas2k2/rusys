import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import type { ActiveContent } from '~/components/runtime/ActiveContentContext';
import { ActiveVariantBox } from '~/features/variants/ActiveVariantBox';
import { useDeleteVariant } from '~/features/variants/hooks/useDeleteVariant';

vi.mock(import('~/features/variants/hooks/useDeleteVariant'));

vi.mock(import('~/features/variants/VariantBox'), (): any => ({
    VariantBox: ({ opened, onClose, onAfterClose, onDelete, ...props }: any) =>
        opened ? (
            <dialog open>
                <button onClick={() => onClose?.()}>Close</button>
                <button onClick={() => onAfterClose?.()}>After Close</button>
                <button onClick={() => onDelete?.()}>Remove variant</button>
                <div>{props.group}</div>
                <div>{props.variant}</div>
            </dialog>
        ) : null,
}));

describe('<ActiveVariantBox>', () => {
    const active: ActiveContent = { action: 'update', data: { group: 'Uogienės', variant: 'p' } };
    const setActive = vi.fn();
    const deleteVariant = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => vi.mocked(useDeleteVariant).mockReturnValue(deleteVariant));

    afterEach(() => vi.clearAllMocks());

    it('does not render box if not active', () => {
        render(
            <MockApp setActive={setActive}>
                <ActiveVariantBox />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders box if active', () => {
        render(
            <MockApp active={active} setActive={setActive}>
                <ActiveVariantBox />
            </MockApp>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Uogienės')).toBeInTheDocument();
        expect(screen.getByText('p')).toBeInTheDocument();
    });

    it('calls setActive with data when onClose is triggered', async () => {
        render(
            <MockApp active={active} setActive={setActive}>
                <ActiveVariantBox />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(setActive).toHaveBeenCalledWith({ data: { group: 'Uogienės', variant: 'p' } });
    });

    it('calls setActive without arguments when onAfterClose is triggered', async () => {
        render(
            <MockApp active={active} setActive={setActive}>
                <ActiveVariantBox />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'After Close' }));

        expect(setActive).toHaveBeenCalledWith();
    });

    it('deletes the active variant after confirmation', async () => {
        render(
            <MockApp active={active} setActive={setActive}>
                <ActiveVariantBox />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove variant' }));
        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(deleteVariant).toHaveBeenCalledWith('Uogienės', 'p');
        expect(setActive).toHaveBeenCalledWith({ data: { group: 'Uogienės', variant: 'p' } });
    });

    it('does not delete when the update action has no data', async () => {
        render(
            <MockApp active={{ action: 'update' }} setActive={setActive}>
                <ActiveVariantBox />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove variant' }));
        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(deleteVariant).not.toHaveBeenCalled();
    });
});
