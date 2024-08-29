export interface VariantAmount {
    variant: string;
    amount: number;
}

export interface YearAmounts {
    year: number;
    amounts: ReadonlyArray<VariantAmount>;
}

export interface Update {
    time: number;
    years: ReadonlyArray<YearAmounts>;
}

export interface RemovingYearAmounts extends YearAmounts {
    removing?: boolean;
}

export interface Details {
    group: string;
    name: string;
    years?: ReadonlyArray<RemovingYearAmounts>;
    missing?: boolean;
    updates?: ReadonlyArray<Update>;
}

export interface Summary {
    group: string;
    name: string;
    years?: ReadonlyArray<YearAmounts>;
}

export interface Group {
    group: string;
    order: number;
}

export interface Variant {
    group: string;
    variant: string;
    order: number;
    long?: string;
    short?: string;
    used?: boolean;
}

export interface UpdateVariant {
    order?: number;
    long?: string;
    short?: string;
}
