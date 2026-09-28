import { Modal, Stack, type ModalProps } from '@mantine/core';
import React, { useCallback } from 'react';

import { SummaryHistoryTab } from '~/features/summary/SummaryHistoryTab';
import { SummaryYearBar } from '~/features/summary/SummaryYearBar';
import { useLabels } from '~/lib/hooks/useLabels';

import './SummaryHistoryBox.css';

export interface SummaryHistoryBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    closeOnEscape?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
}

export function SummaryHistoryBox({
    opened = false,
    title,
    closeOnEscape = true,
    onClose,
    onAfterClose,
}: SummaryHistoryBoxProps) {
    const _ = useLabels();

    const handleClose = useCallback(() => onClose?.(), [onClose]);
    const handleExitTransitionEnd = useCallback(() => onAfterClose?.(), [onAfterClose]);

    return (
        <Modal
            fullScreen
            opened={opened}
            withCloseButton
            onClose={handleClose}
            closeOnEscape={closeOnEscape}
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
