import { act, renderHook } from '@testing-library/react';

import React, { StrictMode } from 'react';

import { useDialogTracking, useFormTracking } from '~/components/common/useUsageTracking';
import { trackFaroEvent } from '~/lib/observability/faro';

vi.mock(import('~/lib/observability/faro'), () => ({ trackFaroEvent: vi.fn() }));

const wrapper = ({ children }: React.PropsWithChildren) => <StrictMode>{children}</StrictMode>;

describe('usage tracking lifecycle', () => {
    afterEach(() => vi.clearAllMocks());

    it('counts actual dialog transitions once under StrictMode', async () => {
        const { rerender, unmount } = renderHook(({ opened }) => useDialogTracking('product', opened), {
            initialProps: { opened: false },
            wrapper,
        });

        expect(trackFaroEvent).not.toHaveBeenCalled();

        rerender({ opened: true });
        await act(async () => {});

        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('dialog_opened', { dialog: 'product' });

        rerender({ opened: true });
        rerender({ opened: false });
        await act(async () => {});

        expect(trackFaroEvent).toHaveBeenCalledTimes(2);
        expect(trackFaroEvent).toHaveBeenLastCalledWith('dialog_closed', { dialog: 'product' });

        unmount();
        await act(async () => {});

        expect(trackFaroEvent).toHaveBeenCalledTimes(2);
    });

    it('closes a still-open dialog on actual unmount without counting effect replay', async () => {
        const { unmount } = renderHook(() => useDialogTracking('review', true), { wrapper });
        await act(async () => {});

        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('dialog_opened', { dialog: 'review' });

        unmount();
        await act(async () => {});

        expect(trackFaroEvent).toHaveBeenLastCalledWith('dialog_closed', { dialog: 'review' });
        expect(trackFaroEvent).toHaveBeenCalledTimes(2);
    });

    it('records completed dirty fields once per dialog session and accepts no values', () => {
        const { result, rerender } = renderHook(({ opened }) => useFormTracking('group', opened), {
            initialProps: { opened: true },
        });
        act(() => result.current.field('group', false));

        expect(trackFaroEvent).not.toHaveBeenCalled();

        act(() => {
            result.current.field('group', true);
            result.current.field('group', true);
        });

        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('form_field_changed', { form: 'group', field: 'group' });

        rerender({ opened: false });
        rerender({ opened: true });
        act(() => result.current.field('group', true));

        expect(trackFaroEvent).toHaveBeenCalledTimes(2);
    });
});
