import { Select, type ComboboxItem } from '@mantine/core';
import React, { useCallback } from 'react';

import { SelectDropdownIcon } from '@icons';

import { CategoryAvatar } from '~/client/filters/CategoryAvatar';
import { CategoryOption } from '~/client/filters/CategoryOption';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabel } from '~/client/hooks/useLabel';
import { useGroups } from '~/client/state/groups/useGroups';
import { ClearFilterIcon } from '~/client/toolbar/ClearFilterIcon';

export function ToolbarGroupFilter() {
    const allGroups = useGroups();
    const [group, setGroup] = useGroupFilter();

    const groupOptions = allGroups.map((g) => ({ value: g.group, label: g.group }));
    const imageByGroup = new Map(allGroups.map((g) => [g.group, g.image?.url]));

    const handleClear = useCallback(() => setGroup(''), [setGroup]);

    return (
        <Select
            placeholder={useLabel('All categories')}
            value={group || null}
            onChange={(value) => setGroup(value || '')}
            data={groupOptions}
            renderOption={({ option }: { option: ComboboxItem }) => (
                <CategoryOption option={option} image={imageByGroup.get(option.value)} />
            )}
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
    );
}
