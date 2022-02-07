export enum Variant {
    BASE = '', // 0.5l
    LARGE = 'd', // 0.75l
    SMALL = 'm', // 0.25l
    EGLYTE = 'e', // eglytės 0.01l
    BAD = 'x', // cypė ar dar kas negerai
}

export type Year = number;
export type Value = Partial<Record<Variant, number>>;
export type Values = Record<Year, Value>;
export type Details = Record<string, Values>;

export interface LoadResponse {
    years?: Year[];
    details?: Details;
    missing?: string[];
}

export interface Profile {
    code?: string;
    tokenId?: string;
    email?: string;
    imageUrl?: string;
    name?: string;
}
