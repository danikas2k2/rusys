import { type Group, type GroupedSet, type Name, type Year } from '~/state/types';

export enum Variant {
    PUSLITRIS = '', // 0.5l
    DIDESNIS = 'd', // 0.75l
    MAZESNIS = 'm', // 0.25l
    EGLYTES = 'e', // eglytės 0.01l
    LITRAS = '1', // 1l
    PUSANTRO = '1.5', // 1.5l
    DVILITRIS = '2', // 2l
    TRILITRIS = '3', // 3l
    BLOGAS = 'x', // cypė ar dar kas negerai
}

export type Amount = Partial<Record<Variant, number>>;
export type Amounts = Record<Year, Amount>;
export type NameWithGroup = { name: Name; group?: Group };
export type NamedAmounts = NameWithGroup & Amounts;
export type TimedAmounts = { time: number } & NamedAmounts;
export type AmountSet = GroupedSet<Amounts>;

export interface WithDetailsState {
    details?: AmountSet;
}
