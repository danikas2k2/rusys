import { Modal, type ModalProps } from '@mantine/core';
import React, { useCallback } from 'react';

import { SummaryNavIcon } from '@icons';

import { DialogIcon } from '~/client/common/DialogIcon';
import { useLabels } from '~/client/hooks/useLabels';
import { SummaryHistoryTab } from '~/client/pages/summary/SummaryHistoryTab';

import './SummaryHistoryBox.pcss';

export interface SummaryHistoryBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
}

export function SummaryHistoryBox({ opened = false, title, onClose, onAfterClose }: SummaryHistoryBoxProps) {
    const _ = useLabels();

    const handleClose = useCallback(() => onClose?.(), [onClose]);
    const handleExitTransitionEnd = useCallback(() => onAfterClose?.(), [onAfterClose]);

    return (
        <Modal
            fullScreen
            opened={opened}
            withCloseButton
            onClose={handleClose}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={
                <>
                    <DialogIcon>
                        <SummaryNavIcon />
                    </DialogIcon>
                    {title}
                </>
            }
            data-dialog="summary"
        >
            <SummaryHistoryTab />
        </Modal>
    );
}
