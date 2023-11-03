import { merge } from 'lodash';
import { type Name } from '~/store/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNamedMap<T>(data: Record<Name, any>[]): T {
    return merge(
        {},
        ...data.map(({ name, ...v }) => ({
            [name]: v,
        }))
    );
}
