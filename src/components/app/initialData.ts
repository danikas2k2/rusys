import type { Group, Product, Summary, Variant } from '~/schema';

export interface InitialAppData {
    groups?: readonly Group[];
    products?: readonly Product[];
    summary?: readonly Summary[];
    variants?: readonly Variant[];
    years?: readonly number[];
}

export type InitialResource = 'groups' | 'products' | 'summary' | 'variants';
