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

// `url` is always icon-sized (<=512x512, roughly square) - a generated thumbnail when the source
// is a photo. `photoUrl` is present only when the source qualifies as a photo, and holds the
// original (larger/non-square) image.
export interface ImageRef {
    url: string;
    photoUrl?: string;
}

export interface Product {
    group: string;
    name: string;
    parent?: string;
    years?: readonly RemovingYearAmounts[];
    missing?: boolean;
    updates?: readonly Update[] | readonly ProductHistoryMeta[];
    undates?: readonly Update[] | readonly ProductHistoryMeta[];
    image?: ImageRef;
    variantImages?: Readonly<Record<string, ImageRef>>;
}

export interface ProductAmounts extends GroupAmounts {
    name: string;
    year: number;
    image?: ImageRef;
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
    review?: boolean;
    image?: ImageRef;
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
}

export type UpdateVariant = Partial<Pick<Variant, 'order' | 'suffix' | 'count' | 'units'>>;
