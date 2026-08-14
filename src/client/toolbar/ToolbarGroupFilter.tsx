import { Group, Select, type ComboboxItem } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { AddIcon, SelectDropdownIcon } from '@icons';

import { CategoryAvatar } from '~/client/filters/CategoryAvatar';
import { CategoryOption } from '~/client/filters/CategoryOption';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabels } from '~/client/hooks/useLabels';
import { GroupBox } from '~/client/pages/groups/GroupBox';
import { useGroups } from '~/client/state/groups/useGroups';
import { ClearFilterIcon } from '~/client/toolbar/ClearFilterIcon';

const NEW_CATEGORY_VALUE = ':new-category';

export function ToolbarGroupFilter() {
    const _ = useLabels();
    const allGroups = useGroups();
    const [group, setGroup] = useGroupFilter();

    const groupOptions = useMemo(
        () => [
            ...allGroups.map((g) => ({ value: g.group, label: g.group })),
            { value: NEW_CATEGORY_VALUE, label: _('New category') },
        ],
        [allGroups, _]
    );
    const imageByGroup = new Map(allGroups.map((g) => [g.group, g.image]));

    const handleClear = useCallback(() => setGroup(''), [setGroup]);
    const [addingCategory, setAddingCategory] = useState(false);
    const handleAddCategoryClose = useCallback(
        (newGroup?: string) => {
            setAddingCategory(false);
            if (newGroup) {
                setGroup(newGroup);
            }
        },
        [setGroup]
    );

    return (
        <>
            <Select
                placeholder={_('All categories')}
                value={group || null}
                onChange={(value) => {
                    if (value === NEW_CATEGORY_VALUE) {
                        setAddingCategory(true);
                    } else {
                        setGroup(value || '');
                    }
                }}
                data={groupOptions}
                renderOption={({ option }: { option: ComboboxItem }) =>
                    option.value === NEW_CATEGORY_VALUE ? (
                        <Group gap="xs" data-separator={!!allGroups.length}>
                            <AddIcon size={14} />
                            {option.label}
                        </Group>
                    ) : (
                        <CategoryOption option={option} image={imageByGroup.get(option.value)} />
                    )
                }
                leftSection={group ? <CategoryAvatar image={imageByGroup.get(group)} label={group} /> : undefined}
                style={{ width: '100%' }}
                allowDeselect
                withAlignedLabels
                checkIconPosition="left"
                rightSectionWidth={group ? 60 : 40}
                styles={{
                    input: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    },
                }}
                rightSection={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                        }}
                    >
                        {group && <ClearFilterIcon onClick={handleClear} />}
                        <SelectDropdownIcon size={16} style={{ pointerEvents: 'none' }} />
                    </div>
                }
            />
            {addingCategory && <GroupBox opened onClose={handleAddCategoryClose} />}
        </>
    );
}
