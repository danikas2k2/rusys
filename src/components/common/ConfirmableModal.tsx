import { Modal, type ModalProps } from '@mantine/core';
import React from 'react';

import { DiscardChangesDialog } from '~/components/common/DiscardChangesDialog';
import { useConfirmClose } from '~/lib/hooks/useConfirmClose';
import { prefersReducedMotion } from '~/lib/utils/motion';

export interface ConfirmableModalProps extends Omit<ModalProps, 'children'> {
    isDirty: () => boolean;
    children: (handleClose: () => void) => React.ReactNode;
}

// Give the on-screen keyboard time to finish animating in before scrolling, so the target
// position is measured against the shrunk viewport rather than the pre-keyboard layout.
const FOCUS_SCROLL_DELAY = 300;
const SCROLLABLE_FOCUS_TAGS = new Set(['INPUT', 'TEXTAREA']);

function handleFocusCapture(event: React.FocusEvent<HTMLDivElement>): void {
    const target = event.target;
    if (target instanceof HTMLElement && SCROLLABLE_FOCUS_TAGS.has(target.tagName)) {
        window.setTimeout(
            () => target.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'instant' : 'smooth' }),
            FOCUS_SCROLL_DELAY
        );
    }
}

export function ConfirmableModal({ isDirty, onClose, children, ...props }: ConfirmableModalProps) {
    const { handleClose, confirming, handleConfirmDiscard, handleCancelDiscard } = useConfirmClose(isDirty, onClose);

    return (
        <>
            <Modal {...props} onClose={handleClose} onFocusCapture={handleFocusCapture}>
                {children(handleClose)}
            </Modal>
            <DiscardChangesDialog opened={confirming} onConfirm={handleConfirmDiscard} onClose={handleCancelDiscard} />
        </>
    );
}
