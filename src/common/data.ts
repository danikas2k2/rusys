// TODO move all types to Cellar namespace to avoid name collision

export interface VariantAmount {
    variant: string;
    amount: number;
    recycled?: boolean;
    suspicious?: boolean;
    home?: boolean;
    expiresAt?: number;
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
    parent?: string;
    /** Additional days after expiresAt during which the product is still treated as usable. */
    expiryToleranceDays?: number;
    years?: readonly RemovingYearAmounts[];
    missing?: boolean;
    updates?: readonly Update[] | readonly ProductHistoryMeta[];
    undates?: readonly Update[] | readonly ProductHistoryMeta[];
    // Always icon-sized (<=512x512, roughly square) - a generated thumbnail when the source is a
    // photo, or the original upload as-is when it already qualifies as an icon.
    image?: string;
    // Present only when the source for `image` qualifies as a photo - the original (larger/
    // non-square) image.
    photo?: string;
    variantImages?: Readonly<Record<string, string>>;
    variantPhotos?: Readonly<Record<string, string>>;
    /** Set instead of deleting so balances and change history remain auditable. */
    archivedAt?: number;
}

export interface ProductAmounts extends GroupAmounts {
    name: string;
    year: number;
    image?: string;
    photo?: string;
}

export interface Summary {
    group: string;
    name: string;
    years?: readonly YearAmounts[];
    image?: string;
    photo?: string;
}

export interface Group {
    group: string;
    order: number;
    annual?: boolean;
    review?: boolean;
    image?: string;
    photo?: string;
    /** An archived category also makes its products and variants unavailable for new work. */
    archivedAt?: number;
}

export type VariantUnits = 'g' | 'kg' | 'l' | 'ml' | 'vnt';

export interface Variant {
    group: string;
    variant: string;
    order: number;
    suffix?: string;
    count?: number;
    units?: VariantUnits;
    used?: boolean;
    archivedAt?: number;
}

export interface ExportArchiveData {
    products: readonly Product[];
    variants: readonly Variant[];
    groups: readonly Group[];
}

export type UpdateVariant = Partial<Pick<Variant, 'order' | 'suffix' | 'count' | 'units'>>;
