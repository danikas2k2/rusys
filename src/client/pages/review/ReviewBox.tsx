import { Button, Group } from '@mantine/core';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { ApplyIcon, CancelIcon, ReviewIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { DialogIcon } from '~/client/common/DialogIcon';
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

import './ReviewBox.pcss';

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
    // A group only enters the changeset once the user has interacted with it; until then,
    // its products are left alone regardless of their (visually unchecked) checkbox state.
    const [touchedGroups, setTouchedGroups] = useState<ReadonlySet<string>>(new Set());
    const [checkedKeys, setCheckedKeys] = useState<ReadonlySet<string>>(new Set());

    useEffect(() => {
        if (opened) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- reset draft state when dialog opens
            setTouchedGroups(new Set());
            setCheckedKeys(new Set());
            setSelectedGroup('');
        }
    }, [opened]);

    const handleToggle = useCallback(
        (key: string, checked: boolean) => {
            setTouchedGroups((prev) => (prev.has(selectedGroup) ? prev : new Set(prev).add(selectedGroup)));
            setCheckedKeys((prev) => {
                const next = new Set(prev);
                if (checked) {
                    next.add(key);
                } else {
                    next.delete(key);
                }
                return next;
            });
        },
        [selectedGroup]
    );

    // Marks the current group as touched and sets all of its given keys to `checked` in one go
    const handleSelectAllInGroup = useCallback(
        (keys: readonly string[], checked: boolean) => {
            setTouchedGroups((prev) => new Set(prev).add(selectedGroup));
            setCheckedKeys((prev) => {
                const next = new Set(prev);
                keys.forEach((key) => (checked ? next.add(key) : next.delete(key)));
                return next;
            });
        },
        [selectedGroup]
    );

    // Returns the current group to the untouched state, removing it from the changeset
    const handleResetGroup = useCallback(
        (keys: readonly string[]) => {
            setTouchedGroups((prev) => {
                const next = new Set(prev);
                next.delete(selectedGroup);
                return next;
            });
            setCheckedKeys((prev) => {
                const next = new Set(prev);
                keys.forEach((key) => next.delete(key));
                return next;
            });
        },
        [selectedGroup]
    );

    const handleApply = useCallback(async () => {
        const reviewGroupNames = new Set(reviewGroups.map((g) => g.group));
        const updates = products
            .filter((p) => touchedGroups.has(p.group) && reviewGroupNames.has(p.group) && !isEmpty(p.years))
            .reduce<{ group: string; name: string; missing: boolean }[]>((acc, p) => {
                const missing = !checkedKeys.has(getId(p.group, p.name));
                if (missing !== !!p.missing) {
                    acc.push({ group: p.group, name: p.name, missing });
                }
                return acc;
            }, []);
        await applyReview(updates);
        onClose?.();
    }, [reviewGroups, products, touchedGroups, checkedKeys, applyReview, onClose]);

    return (
        <ConfirmableModal
            fullScreen
            opened={opened}
            withCloseButton
            isDirty={() => touchedGroups.size > 0}
            onClose={() => onClose?.()}
            onExitTransitionEnd={onAfterClose}
            title={
                <>
                    <DialogIcon>
                        <ReviewIcon />
                    </DialogIcon>
                    <Group className="ReviewBox-filter" gap="xs" wrap="nowrap">
                        <ToolbarFilter />
                    </Group>
                </>
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
                            <ReviewTable
                                group={selectedGroup}
                                touched={touchedGroups.has(selectedGroup)}
                                checkedKeys={checkedKeys}
                                onToggle={handleToggle}
                                onSelectAll={handleSelectAllInGroup}
                                onReset={handleResetGroup}
                            />
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
                        <Button
                            variant="outline"
                            color="gray"
                            leftSection={<CancelIcon size={18} />}
                            onClick={handleClose}
                        >
                            <Label>Cancel</Label>
                        </Button>
                        <Button leftSection={<ApplyIcon size={18} />} onClick={handleApply}>
                            <Label>Apply</Label>
                        </Button>
                    </Group>
                </>
            )}
        </ConfirmableModal>
    );
}
