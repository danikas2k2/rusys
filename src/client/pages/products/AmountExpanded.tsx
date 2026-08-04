import { ActionIcon, Button, Flex, Group, Modal, Stack, Textarea } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import React, { useState } from 'react';

import { AddExpiryIcon, HomeIcon, SuspiciousIcon } from '@icons';

import { DialogIcon } from '~/client/common/DialogIcon';
import { useLabels } from '~/client/hooks/useLabels';
import { AmountVariantRow, type VariantEditType } from '~/client/pages/products/AmountVariantRow';

export interface VariantDelta {
    updated: number;
    consumed: number;
    recycled: number;
}

interface VariantExpandedRowsProps {
    delta: VariantDelta;
    baseAmount: number;
    comment: string;
    onChange: (type: VariantEditType, value: number) => void;
    onCommentChange: (value: string) => void;
    onAddSuspicious?: () => void;
    onAddHome?: () => void;
    onAddExpiry?: (value: string | null) => void;
    children?: React.ReactNode;
}

export function AmountExpanded({
    delta,
    baseAmount,
    comment,
    onChange,
    onCommentChange,
    onAddSuspicious,
    onAddHome,
    onAddExpiry,
    children,
}: VariantExpandedRowsProps) {
    const _ = useLabels();
    const [expiryPickerOpened, setExpiryPickerOpened] = useState(false);
    const handlePickExpiry = (value: string | null) => {
        setExpiryPickerOpened(false);
        onAddExpiry?.(value);
    };
    // No point picking a date for an already-expired product - disable everything before today.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const minUpdated = -(baseAmount + delta.consumed + delta.recycled);
    const minConsumed = -(baseAmount + delta.updated + delta.recycled);
    const minRecycled = -(baseAmount + delta.updated + delta.consumed);

    return (
        <Stack gap="xs" py="xs">
            <AmountVariantRow type="updated" delta={delta.updated} minDelta={minUpdated} onChange={onChange} />
            <AmountVariantRow type="consumed" delta={delta.consumed} minDelta={minConsumed} onChange={onChange} />
            <AmountVariantRow type="recycled" delta={delta.recycled} minDelta={minRecycled} onChange={onChange} />
            <Textarea
                placeholder={_('Comment')}
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                autosize
                minRows={1}
                maxRows={3}
            />
            {children}
            {(onAddSuspicious || onAddHome || onAddExpiry) && (
                <Group gap="xs" justify="center" pt="sm">
                    {onAddSuspicious && (
                        <Button
                            variant="light"
                            color="moderate"
                            size="sm"
                            leftSection={<SuspiciousIcon size={14} />}
                            onClick={onAddSuspicious}
                        >
                            {_('Suspicious')}
                        </Button>
                    )}
                    {onAddHome && (
                        <Button
                            variant="light"
                            color="blue"
                            size="sm"
                            leftSection={<HomeIcon size={14} />}
                            onClick={onAddHome}
                        >
                            {_('Home')}
                        </Button>
                    )}
                    {onAddExpiry && (
                        <>
                            <ActionIcon
                                variant="light"
                                color="gray"
                                size="lg"
                                aria-label={_('Valid until')}
                                onClick={() => setExpiryPickerOpened(true)}
                            >
                                <AddExpiryIcon size={16} />
                            </ActionIcon>
                            <Modal
                                opened={expiryPickerOpened}
                                onClose={() => setExpiryPickerOpened(false)}
                                centered
                                withCloseButton
                                size="sm"
                                title={
                                    <DialogIcon aria-label={_('Valid until')}>
                                        <AddExpiryIcon />
                                    </DialogIcon>
                                }
                            >
                                <Flex justify="center" align="flex-start" mih="20rem">
                                    <DatePicker onChange={handlePickExpiry} minDate={startOfToday} />
                                </Flex>
                            </Modal>
                        </>
                    )}
                </Group>
            )}
        </Stack>
    );
}
