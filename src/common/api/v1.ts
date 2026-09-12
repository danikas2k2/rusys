export const BASE = '/api/v1';

const segment = (value: string): string => encodeURIComponent(value);

// TODO add types
export const API = {
    authClientId: () => `${BASE}/auth/client-id`,
    access: (email: string): string => `${BASE}/access?email=${segment(email)}`,
    userProfiles: (emails: readonly string[] = []): string =>
        `${BASE}/user-profiles${emails.length ? `?${emails.map((email) => `email=${segment(email)}`).join('&')}` : ''}`,
    userProfile: (email: string): string => `${BASE}/user-profiles/${segment(email)}`,
    groups: () => `${BASE}/groups`,
    group: (group: string): string => `${BASE}/groups/${segment(group)}`,
    groupOrder: () => `${BASE}/groups/order`,
    groupVariant: (group: string, variant: string): string =>
        `${BASE}/groups/${segment(group)}/variants/${segment(variant)}`,
    groupVariantCopies: (group: string, variant: string): string =>
        `${BASE}/groups/${segment(group)}/variants/${segment(variant)}/copies`,
    groupVariantOrder: (group: string): string => `${BASE}/groups/${segment(group)}/variants/order`,
    groupProduct: (group: string, name: string): string => `${BASE}/groups/${segment(group)}/products/${segment(name)}`,
    productReviewStatuses: (): string => `${BASE}/products/review-statuses`,
    productYear: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${segment(group)}/products/${segment(name)}/years/${year}`,
    productAmounts: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${segment(group)}/products/${segment(name)}/years/${year}/amounts`,
    productAmountHistory: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${segment(group)}/products/${segment(name)}/years/${year}/amount-history`,
    productImage: (group: string, name: string): string =>
        `${BASE}/groups/${segment(group)}/products/${segment(name)}/image`,
    productVariantImage: (group: string, name: string, variant: string): string =>
        `${BASE}/groups/${segment(group)}/products/${segment(name)}/variants/${segment(variant)}/image`,
    variants: () => `${BASE}/variants`,
    products: () => `${BASE}/products`,
    summary: () => `${BASE}/summary`,
    exportLatest: () => `${BASE}/exports/latest`,
    import: () => `${BASE}/imports`,
    productHistory: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${segment(group)}/products/${segment(name)}/years/${year}/history`,
    summaryHistory: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${segment(group)}/products/${segment(name)}/years/${year}/summary-history`,
} as const;
