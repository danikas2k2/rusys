import { merge } from 'lodash';
import { type NameWithGroup } from '~/state/details/types';
import { type Group, type Name, type Year } from '~/state/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNamedMap<T>(data: (NameWithGroup & Record<Year, any>)[]): T {
    return merge(
        {},
        ...data.map(({ group, name, ...v }) => ({
            [group ?? '']: { [name]: v },
        }))
    );
}

export function getGroupQuery(group: Group): Record<string, unknown> {
    return group ? { group } : { $or: [{ group }, { group: { $exists: false } }] };
}

export function getGroupAndNameQuery(group: Group, name: Name): Record<string, unknown> {
    return { ...getGroupQuery(group), name };
}
