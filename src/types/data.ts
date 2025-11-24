// TODO move all types to Cellar namespace to avoid name collision

export interface VariantAmount {
    variant: string;
    amount: number;
    recycled?: boolean;
}

export interface YearAmounts {
    year: number;
    amounts: readonly VariantAmount[];
}

export interface Update {
    time: number;
    years: readonly YearAmounts[];
}

export interface RemovingYearAmounts extends YearAmounts {
    removing?: boolean;
}

export interface Details {
    group: string;
    name: string;
    years?: readonly RemovingYearAmounts[];
    missing?: boolean;
    updates?: readonly Update[];
}

export interface DetailsAmounts {
    group: string;
    name: string;
    year: number;
    amounts?: readonly VariantAmount[];
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

export interface Variant {
    group: string;
    variant: string;
    order: number;
    suffix?: string;
    used?: boolean;
}

export type UpdateVariant = Partial<Pick<Variant, 'order' | 'suffix'>>;

export type WithId<T> = T & { id: string };
