import { transliterate as translit } from 'transliteration';
import { type Name } from '~/store/types';

export const matchParts = (name: Name, filter: string): boolean =>
    translit(filter)
        .toLowerCase()
        .split(/\P{L}+/u)
        .filter((w) => w)
        .every((w) => translit(name).match(new RegExp(w, 'i')));
