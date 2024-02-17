import { transliterate as translit } from 'transliteration';

export const matchParts = (name: string, filter: string): boolean =>
    translit(filter)
        .toLowerCase()
        .split(/\P{L}+/u)
        .filter((w) => w)
        .every((w) => translit(name).match(new RegExp(w, 'i')));
