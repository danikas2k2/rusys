import { Modal, Stack, type ModalProps } from '@mantine/core';
import React, { useCallback } from 'react';

import { useLabels } from '~/client/hooks/useLabels';
import { SummaryHistoryTab } from '~/client/pages/summary/SummaryHistoryTab';
import { SummaryYearBar } from '~/client/pages/summary/SummaryYearBar';

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
            title={title}
            data-dialog="summary"
        >
            <Stack gap="sm">
                <SummaryYearBar />
                <SummaryHistoryTab />
            </Stack>
        </Modal>
    );
}
