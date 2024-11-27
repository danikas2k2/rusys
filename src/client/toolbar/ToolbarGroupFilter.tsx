import { Option, Select } from '@ui/Select';
import React, { type ChangeEvent } from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import { useClearGroup } from '~/state/group/useClearGroup';
import { useGroup } from '~/state/group/useGroup';
import { useSetGroup } from '~/state/group/useSetGroup';
import { useGroups } from '~/state/groups/useGroups';

export function ToolbarGroupFilter() {
    const allGroups = useLabel('All groups');
    const groups = [''].concat(useGroups()?.map((v) => v.group) ?? []);
    const group = useGroup() || '';
    const setGroup = useSetGroup();
    const clearGroup = useClearGroup();
    const handleChange = (e: ChangeEvent, value: string) => (value ? setGroup(value) : clearGroup());
    return (
        <Select fullWidth color="primary" value={group} onChange={handleChange}>
            {groups.map((g) => (
                <Option key={g} value={g}>
                    {g || allGroups}
                </Option>
            ))}
        </Select>
    );
}
