import { Modal, type ModalProps } from '@mantine/core';
import React from 'react';

import { DiscardChangesDialog } from '~/client/common/DiscardChangesDialog';
import { useConfirmClose } from '~/client/hooks/useConfirmClose';

export interface ConfirmableModalProps extends Omit<ModalProps, 'children'> {
    isDirty: () => boolean;
    children: (handleClose: () => void) => React.ReactNode;
}

export function ConfirmableModal({ isDirty, onClose, children, ...modalProps }: ConfirmableModalProps) {
    const { handleClose, confirming, handleConfirmDiscard, handleCancelDiscard } = useConfirmClose(isDirty, onClose);

    return (
        <>
            <Modal {...modalProps} onClose={handleClose}>
                {children(handleClose)}
            </Modal>
            <DiscardChangesDialog opened={confirming} onConfirm={handleConfirmDiscard} onClose={handleCancelDiscard} />
        </>
    );
}
