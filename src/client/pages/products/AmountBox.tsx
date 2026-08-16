import { ActionIcon, Group, Stack, Tabs, type ModalProps } from '@mantine/core';
import React, { useCallback, useRef, useState } from 'react';

import { DeleteIcon, EditIcon, HistoryTabIcon, QuantitiesTabIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { Label } from '~/client/common/Label';
import { ProductDialogIcon } from '~/client/common/ProductDialogIcon';
import { useLabels } from '~/client/hooks/useLabels';
import { AmountHistoryTab } from '~/client/pages/products/AmountHistoryTab';
import { AmountVariantsTab } from '~/client/pages/products/AmountVariantsTab';
import { ProductYearBar } from '~/client/pages/products/ProductYearBar';

import './AmountBox.pcss';

export interface ValueListBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    photo?: string;
    // Mantine's own Escape/click-outside handling is per-instance and unaware of other open
    // modals - when Edit/Delete opens right on top of this one (see ActiveAmountBox), both would
    // otherwise close together on a single Escape press. Default true (Mantine's own default);
    // callers stacking another dialog on top pass false for as long as that dialog is open.
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function AmountBox({
    opened = false,
    title,
    photo,
    closeOnEscape = true,
    closeOnClickOutside = true,
    onClose,
    onAfterClose,
    onEdit,
    onDelete,
}: ValueListBoxProps) {
    const _ = useLabels();
    const [hasChanges, setHasChanges] = useState(false);
    const quantitiesPanelRef = useRef<HTMLDivElement>(null);

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
            closeOnEscape={closeOnEscape}
            closeOnClickOutside={closeOnClickOutside}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={
                <Group justify="space-between" wrap="nowrap" flex={1}>
                    <Group wrap="nowrap" gap="sm">
                        <ProductDialogIcon photo={photo} />
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
                <Stack className="amount-box-content" gap="sm">
                    <ProductYearBar disabled={hasChanges} />
                    <Tabs className="amount-box-tabs" variant="outline" radius="sm" defaultValue="quantities">
                        <Tabs.List>
                            <Tabs.Tab fz="md" value="quantities" leftSection={<QuantitiesTabIcon size={18} />}>
                                <Label>Quantities</Label>
                            </Tabs.Tab>
                            <Tabs.Tab fz="md" value="history" leftSection={<HistoryTabIcon size={18} />}>
                                <Label>History</Label>
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel
                            className="amount-box-tab-panel"
                            value="quantities"
                            pt="sm"
                            ref={quantitiesPanelRef}
                        >
                            <AmountVariantsTab
                                onChangesUpdate={setHasChanges}
                                onClose={onClose}
                                scrollContainerRef={quantitiesPanelRef}
                            />
                        </Tabs.Panel>

                        <Tabs.Panel className="amount-box-tab-panel" value="history" pt="sm">
                            <AmountHistoryTab />
                        </Tabs.Panel>
                    </Tabs>
                </Stack>
            )}
        </ConfirmableModal>
    );
}
