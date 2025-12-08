import React, { useCallback } from 'react';

import { Select } from '@mantine/core';
import { IconSelector } from '@tabler/icons-react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabel } from '~/client/hooks/useLabel';
import { useGroups } from '~/client/state/groups/useGroups';
import { ClearFilterIcon } from '~/client/toolbar/ClearFilterIcon';

export function ToolbarGroupFilter() {
    const groups = useGroups().map((v) => v.group);
    const [group, setGroup] = useGroupFilter();

    const groupOptions = groups.map((g) => ({ value: g, label: g }));

    const handleClear = useCallback(() => setGroup(''), [setGroup]);

    return (
        <Select
            placeholder={useLabel('All groups')}
            value={group || null}
            onChange={(value) => setGroup(value || '')}
            data={groupOptions}
            style={{ width: '100%' }}
            allowDeselect
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
                    <IconSelector size={16} style={{ pointerEvents: 'none' }} />
                </div>
            }
        />
    );
}
