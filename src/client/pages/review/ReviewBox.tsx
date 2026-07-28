import { Button, Group } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { Label } from '~/client/common/Label';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { useLabels } from '~/client/hooks/useLabels';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useGroupsWithReviewProducts } from '~/client/pages/review/hooks/useGroupsWithReviewProducts';
import { ReviewTable } from '~/client/pages/review/ReviewTable';
import { useApplyReview } from '~/client/state/products/useApplyReview';
import { useProducts } from '~/client/state/products/useProducts';
import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';
import { getId } from '~/client/utils/id';

export interface ReviewBoxProps {
    opened?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
}

export function ReviewBox({ opened = false, onClose, onAfterClose }: ReviewBoxProps) {
    const _ = useLabels();
    const reviewGroups = useSortedGroups().filter((g) => g.review);
    const groupsWithReviewProducts = useGroupsWithReviewProducts();
    const products = useProducts();
    const applyReview = useApplyReview();

    const [selectedGroup, setSelectedGroup] = useState('');
    const [checkedKeys, setCheckedKeys] = useState<ReadonlySet<string>>(new Set());

    useEffect(() => {
        if (opened) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- reset draft state when dialog opens
            setCheckedKeys(new Set());

            setSelectedGroup('');
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
        const reviewGroupNames = new Set(reviewGroups.map((g) => g.group));
        const updates = products
            .filter((p) => reviewGroupNames.has(p.group) && !isEmpty(p.years))
            .reduce<{ group: string; name: string; missing: boolean }[]>((acc, p) => {
                const missing = !checkedKeys.has(getId(p.group, p.name));
                if (missing !== !!p.missing) {
                    acc.push({ group: p.group, name: p.name, missing });
                }
                return acc;
            }, []);
        await applyReview(updates);
        onClose?.();
    }, [reviewGroups, products, checkedKeys, applyReview, onClose]);

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
                        <CategoryRailLayout
                            groups={reviewGroups}
                            selected={selectedGroup}
                            onSelect={setSelectedGroup}
                            groupsWithContent={groupsWithReviewProducts}
                        >
                            <ReviewTable group={selectedGroup} checkedKeys={checkedKeys} onToggle={handleToggle} />
                        </CategoryRailLayout>
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
