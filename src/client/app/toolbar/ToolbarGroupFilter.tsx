import React, { type ChangeEvent } from 'react';

import { Option, Select } from '@ui/Select';

import { useGroupFilterContext } from '~/client/app/filters/GroupFilterContext';
import { useLabel } from '~/client/app/hooks/useLabel';
import { useGroups } from '~/client/state/groups/useGroups';

export function ToolbarGroupFilter() {
    const allGroups = useLabel('All groups');
    const groups = [''].concat(useGroups()?.map((v) => v.group) ?? []);
    const [group = '', setGroup] = useGroupFilterContext();
    const handleChange = (_: ChangeEvent, value: string) => setGroup(value || '');
    return (
        <Select fullWidth value={group} onChange={handleChange}>
            {groups.map((g) => (
                <Option key={g} value={g}>
                    {g || allGroups}
                </Option>
            ))}
        </Select>
    );
}
