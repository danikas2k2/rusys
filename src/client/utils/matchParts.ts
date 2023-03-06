import type { Name } from '~/store/details/types';

export const matchParts = (name: Name, filter: string): boolean =>
    filter
        .toLowerCase()
        .split(/\P{L}+/u)
        .filter((w) => w)
        .every((w) => name.match(new RegExp(w, 'i')));
