import { useCallback, useState } from 'react';

export interface ConfirmClose {
    handleClose: () => void;
    confirming: boolean;
    handleConfirmDiscard: () => void;
    handleCancelDiscard: () => void;
}

export function useConfirmClose(isDirty: () => boolean, onClose: () => void): ConfirmClose {
    const [confirming, setConfirming] = useState(false);

    const handleClose = useCallback(() => {
        if (isDirty()) {
            setConfirming(true);
        } else {
            onClose();
        }
    }, [isDirty, onClose]);

    const handleConfirmDiscard = useCallback(() => {
        setConfirming(false);
        onClose();
    }, [onClose]);

    const handleCancelDiscard = useCallback(() => setConfirming(false), []);

    return { handleClose, confirming, handleConfirmDiscard, handleCancelDiscard };
}
