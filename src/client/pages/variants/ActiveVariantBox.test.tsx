import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import type { ActiveContent } from '~/client/common/ActiveContentContext';
import { ActiveVariantBox } from '~/client/pages/variants/ActiveVariantBox';

vi.mock('~/client/pages/variants/VariantBox', async () => ({
    VariantBox: ({ opened, onClose, onAfterClose, ...props }: any) => {
        if (!opened) return null;
        return (
            <dialog open>
                <button onClick={() => onClose?.()}>Close</button>
                <button onClick={() => onAfterClose?.()}>After Close</button>
                <div>{props.group}</div>
                <div>{props.variant}</div>
            </dialog>
        );
    },
}));

describe('<ActiveVariantBox>', () => {
    const active: ActiveContent = { action: 'update', data: { group: 'Uogienės', variant: 'p' } };
    const setActive = vi.fn();

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
});
