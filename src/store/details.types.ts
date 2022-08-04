export type Year = number;
export type Name = string;

export enum Variant {
    PUSLITRIS = '', // 0.5l
    DIDESNIS = 'd', // 0.75l
    MAZESNIS = 'm', // 0.25l
    EGLYTES = 'e', // eglytės 0.01l
    PUSANTRO = '1.5', // 1.5l
    DVILITRIS = '2', // 2l
    TRILITRIS = '3', // 3l
    BLOGAS = 'x', // cypė ar dar kas negerai
}

export type Value = Partial<Record<Variant, number>>;
export type Values = Record<Year, Value>;
export type NamedValues = { name: string } & Values;
export type Details = Record<Name, Values>;
