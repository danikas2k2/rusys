const base = '/api/v1';

const segment = (value: string): string => encodeURIComponent(value);

export const ApiV1 = {
    authClientId: `${base}/auth/client-id`,
    access: (email: string): string => `${base}/access?email=${segment(email)}`,
    userProfiles: (emails: readonly string[] = []): string =>
        `${base}/user-profiles${emails.length ? `?${emails.map((email) => `email=${segment(email)}`).join('&')}` : ''}`,
    userProfile: (email: string): string => `${base}/user-profiles/${segment(email)}`,
    groups: `${base}/groups`,
    group: (group: string): string => `${base}/groups/${segment(group)}`,
    groupOrder: `${base}/groups/order`,
    groupVariant: (group: string, variant: string): string =>
        `${base}/groups/${segment(group)}/variants/${segment(variant)}`,
    groupVariantCopies: (group: string, variant: string): string =>
        `${base}/groups/${segment(group)}/variants/${segment(variant)}/copies`,
    groupVariantOrder: (group: string): string => `${base}/groups/${segment(group)}/variants/order`,
    groupProduct: (group: string, name: string): string => `${base}/groups/${segment(group)}/products/${segment(name)}`,
    productReviewStatuses: (group: string): string => `${base}/groups/${segment(group)}/products/review-statuses`,
    productYear: (group: string, name: string, year: number): string =>
        `${base}/groups/${segment(group)}/products/${segment(name)}/years/${year}`,
    productAmounts: (group: string, name: string, year: number): string =>
        `${base}/groups/${segment(group)}/products/${segment(name)}/years/${year}/amounts`,
    productAmountHistory: (group: string, name: string, year: number): string =>
        `${base}/groups/${segment(group)}/products/${segment(name)}/years/${year}/amount-history`,
    productImage: (group: string, name: string): string =>
        `${base}/groups/${segment(group)}/products/${segment(name)}/image`,
    productVariantImage: (group: string, name: string, variant: string): string =>
        `${base}/groups/${segment(group)}/products/${segment(name)}/variants/${segment(variant)}/image`,
    variants: `${base}/variants`,
    products: `${base}/products`,
    summary: `${base}/summary`,
    exportLatest: `${base}/exports/latest`,
    import: `${base}/imports`,
    productHistory: (group: string, name: string, year: number): string =>
        `${base}/groups/${segment(group)}/products/${segment(name)}/years/${year}/history`,
    summaryHistory: (group: string, name: string, year: number): string =>
        `${base}/groups/${segment(group)}/products/${segment(name)}/years/${year}/summary-history`,
} as const;
