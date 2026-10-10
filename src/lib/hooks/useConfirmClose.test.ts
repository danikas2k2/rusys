import { act, renderHook, waitFor } from '@testing-library/react';

import { useConfirmClose } from '~/lib/hooks/useConfirmClose';

describe('useConfirmClose', () => {
    it('closes immediately when not dirty', () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useConfirmClose(() => false, onClose));

        act(() => result.current.handleClose());

        expect(onClose).toHaveBeenCalledWith();
        expect(result.current.confirming).toBe(false);
    });

    it('asks for confirmation after the current event when dirty', async () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useConfirmClose(() => true, onClose));

        act(() => result.current.handleClose());

        expect(onClose).not.toHaveBeenCalled();
        expect(result.current.confirming).toBe(false);

        await waitFor(() => expect(result.current.confirming).toBe(true));
    });

    it('closes after confirming discard', async () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useConfirmClose(() => true, onClose));

        act(() => result.current.handleClose());
        await waitFor(() => expect(result.current.confirming).toBe(true));
        act(() => result.current.handleConfirmDiscard());

        expect(onClose).toHaveBeenCalledWith();
        expect(result.current.confirming).toBe(false);
    });

    it('keeps dialog open and does not close when cancelling discard', async () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useConfirmClose(() => true, onClose));

        act(() => result.current.handleClose());
        await waitFor(() => expect(result.current.confirming).toBe(true));
        act(() => result.current.handleCancelDiscard());

        expect(onClose).not.toHaveBeenCalled();
        expect(result.current.confirming).toBe(false);
    });
});
