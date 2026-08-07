import { ActionIcon, Group, Tabs, type ModalProps } from '@mantine/core';
import React, { useCallback, useState } from 'react';

import { DeleteIcon, EditIcon, HistoryTabIcon, QuantitiesTabIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { Label } from '~/client/common/Label';
import { ProductDialogIcon } from '~/client/common/ProductDialogIcon';
import { useLabels } from '~/client/hooks/useLabels';
import { AmountHistoryTab } from '~/client/pages/products/AmountHistoryTab';
import { AmountVariantsTab } from '~/client/pages/products/AmountVariantsTab';

import './AmountBox.pcss';

export interface ValueListBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    image?: string;
    photo?: string;
    onClose?: () => void;
    onAfterClose?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function AmountBox({
    opened = false,
    title,
    image,
    photo,
    onClose,
    onAfterClose,
    onEdit,
    onDelete,
}: ValueListBoxProps) {
    const _ = useLabels();
    const [hasChanges, setHasChanges] = useState(false);

    const handleExitTransitionEnd = useCallback(() => {
        onAfterClose?.();
    }, [onAfterClose]);

    return (
        <ConfirmableModal
            fullScreen
            opened={opened}
            withCloseButton
            isDirty={() => hasChanges}
            onClose={() => onClose?.()}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={
                <Group justify="space-between" wrap="nowrap" flex={1}>
                    <Group wrap="nowrap" gap="sm">
                        <ProductDialogIcon image={image} photo={photo} />
                        {title}
                    </Group>
                    <Group gap={4} wrap="nowrap">
                        {onEdit && (
                            <ActionIcon variant="subtle" color="gray" onClick={onEdit} aria-label={_('Edit')}>
                                <EditIcon size={18} />
                            </ActionIcon>
                        )}
                        {onDelete && (
                            <ActionIcon variant="subtle" color="negative" onClick={onDelete} aria-label={_('Remove')}>
                                <DeleteIcon size={18} />
                            </ActionIcon>
                        )}
                    </Group>
                </Group>
            }
            data-dialog="product"
        >
            {() => (
                <Tabs
                    variant="outline"
                    radius="sm"
                    defaultValue="quantities"
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                    <Tabs.List>
                        <Tabs.Tab fz="md" value="quantities" leftSection={<QuantitiesTabIcon size={18} />}>
                            <Label>Quantities</Label>
                        </Tabs.Tab>
                        <Tabs.Tab fz="md" value="history" leftSection={<HistoryTabIcon size={18} />}>
                            <Label>History</Label>
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="quantities" pt="sm">
                        <AmountVariantsTab onChangesUpdate={setHasChanges} onClose={onClose} />
                    </Tabs.Panel>

                    <Tabs.Panel value="history" pt="sm">
                        <AmountHistoryTab />
                    </Tabs.Panel>
                </Tabs>
            )}
        </ConfirmableModal>
    );
}
