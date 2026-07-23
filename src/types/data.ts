// TODO move all types to Cellar namespace to avoid name collision

export interface VariantAmount {
    variant: string;
    amount: number;
    recycled?: boolean;
    suspicious?: boolean;
    home?: boolean;
}

export interface YearAmounts {
    year: number;
    amounts: readonly VariantAmount[];
}

export interface Update {
    time: number;
    user?: string;
    comment?: string;
    years: readonly YearAmounts[];
}

export interface GroupAmounts {
    group: string;
    amounts?: readonly VariantAmount[];
}

export interface History extends GroupAmounts {
    sessionId?: string;
    time: number;
    name: string;
    year?: number;
    user?: string;
    comment?: string;
}

export interface UserProfile {
    email: string;
    name?: string;
    picture?: string;
    updatedAt?: number;
}

export interface RemovingYearAmounts extends YearAmounts {
    removing?: boolean;
}

export interface ProductHistoryMeta {
    year: number;
}

export interface Product {
    group: string;
    name: string;
    years?: readonly RemovingYearAmounts[];
    missing?: boolean;
    updates?: readonly Update[] | readonly ProductHistoryMeta[];
    undates?: readonly Update[] | readonly ProductHistoryMeta[];
}

export interface ProductAmounts extends GroupAmounts {
    name: string;
    year: number;
}

export interface Summary {
    group: string;
    name: string;
    years?: readonly YearAmounts[];
}

export interface Group {
    group: string;
    order: number;
    annual?: boolean;
}

export type VariantUnits = 'g' | 'kg' | 'l' | 'ml' | 'vnt';

export interface Variant {
    group: string;
    variant: string;
    name?: string;
    order: number;
    suffix?: string;
    count?: number;
    units?: VariantUnits;
    used?: boolean;
}

export type UpdateVariant = Partial<Pick<Variant, 'order' | 'name' | 'suffix' | 'count' | 'units'>>;
