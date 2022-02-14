export type Year = number;
export type Name = string;

export enum Variant {
    BASE = '', // 0.5l
    LARGE = 'd', // 0.75l
    SMALL = 'm', // 0.25l
    EGLYTE = 'e', // eglytės 0.01l
    BAD = 'x', // cypė ar dar kas negerai
}

export type Value = Partial<Record<Variant, number>>;
export type Values = Record<Year, Value>;
export type Details = Record<Name, Values>;
