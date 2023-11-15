import { type Name } from '~/state/types';

export function compareNames(a: Name, b: Name): number {
    return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
}
