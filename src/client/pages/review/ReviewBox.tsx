import { Button, Group } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { ReviewTable } from '~/client/pages/review/ReviewTable';
import { useGroups } from '~/client/state/groups/useGroups';
import { useApplyReview } from '~/client/state/products/useApplyReview';
import { useProducts } from '~/client/state/products/useProducts';
import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { getId } from '~/client/utils/id';

export interface ReviewBoxProps {
    opened?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
}

export function ReviewBox({ opened = false, onClose, onAfterClose }: ReviewBoxProps) {
    const _ = useLabels();
    const groups = useGroups();
    const products = useProducts();
    const applyReview = useApplyReview();

    const [checkedKeys, setCheckedKeys] = useState<ReadonlySet<string>>(new Set());

    useEffect(() => {
        if (opened) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- reset draft state when dialog opens
            setCheckedKeys(new Set());
        }
    }, [opened]);

    const handleToggle = useCallback((key: string, checked: boolean) => {
        setCheckedKeys((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(key);
            } else {
                next.delete(key);
            }
            return next;
        });
    }, []);

    const handleApply = useCallback(async () => {
        const reviewGroups = new Set(groups.filter((g) => g.review).map((g) => g.group));
        const updates = products
            .filter((p) => reviewGroups.has(p.group) && !isEmpty(p.years))
            .reduce<{ group: string; name: string; missing: boolean }[]>((acc, p) => {
                const missing = !checkedKeys.has(getId(p.group, p.name));
                if (missing !== !!p.missing) {
                    acc.push({ group: p.group, name: p.name, missing });
                }
                return acc;
            }, []);
        await applyReview(updates);
        onClose?.();
    }, [groups, products, checkedKeys, applyReview, onClose]);

    return (
        <ConfirmableModal
            fullScreen
            opened={opened}
            withCloseButton
            isDirty={() => checkedKeys.size > 0}
            onClose={() => onClose?.()}
            onExitTransitionEnd={onAfterClose}
            title={
                <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                    <ToolbarFilter />
                    <ToolbarGroupFilter />
                </Group>
            }
            closeButtonProps={{ 'aria-label': _('Close'), ms: 8 }}
            styles={{
                content: { display: 'flex', flexDirection: 'column' },
                body: { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', padding: 0 },
            }}
        >
            {(handleClose) => (
                <>
                    <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
                        <ReviewTable checkedKeys={checkedKeys} onToggle={handleToggle} />
                    </div>
                    <Group
                        justify="flex-end"
                        p="md"
                        style={{
                            flex: '0 0 auto',
                            borderTop: '1px solid var(--mantine-color-default-border)',
                        }}
                    >
                        <Button variant="outline" color="gray" leftSection={<IconX size={18} />} onClick={handleClose}>
                            <Label>Cancel</Label>
                        </Button>
                        <Button leftSection={<IconCheck size={18} />} onClick={handleApply}>
                            <Label>Apply</Label>
                        </Button>
                    </Group>
                </>
            )}
        </ConfirmableModal>
    );
}
