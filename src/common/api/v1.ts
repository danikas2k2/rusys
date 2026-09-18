export const BASE = '/api/v1';

// TODO add types
export const API = {
    /** Gets the Google OAuth client ID. */
    authClientId: () => `${BASE}/auth/client-id`,

    /**
     * Checks whether an email address can access the application.
     * @param email The email address to check.
     */
    access: (email: string): string => `${BASE}/access?email=${encodeURIComponent(email)}`,

    /**
     * Gets user profiles, optionally filtered by email address.
     * @param emails The email addresses to use as filters.
     */
    userProfiles: (emails: readonly string[] = []): string =>
        `${BASE}/user-profiles${emails.length ? `?${emails.map((email) => `email=${encodeURIComponent(email)}`).join('&')}` : ''}`,

    /**
     * Gets or updates one user profile by email address.
     * @param email The user's email address.
     */
    userProfile: (email: string): string => `${BASE}/user-profiles/${encodeURIComponent(email)}`,

    /** Gets all categories. */
    groups: () => `${BASE}/groups`,

    /**
     * Gets, updates, or deletes one category.
     * @param group The category name.
     */
    group: (group: string): string => `${BASE}/groups/${encodeURIComponent(group)}`,

    /** Updates the category ordering. */
    groupOrder: () => `${BASE}/groups/order`,

    /**
     * Updates or deletes one category variant.
     * @param group The category name.
     * @param variant The variant name.
     */
    groupVariant: (group: string, variant: string): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/variants/${encodeURIComponent(variant)}`,

    /**
     * Creates copies of a variant in another category.
     * @param group The source category name.
     * @param variant The variant to copy.
     */
    groupVariantCopies: (group: string, variant: string): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/variants/${encodeURIComponent(variant)}/copies`,

    /**
     * Updates the ordering of variants in one category.
     * @param group The category name.
     */
    groupVariantOrder: (group: string): string => `${BASE}/groups/${encodeURIComponent(group)}/variants/order`,

    /**
     * Gets, renames, moves, or deletes one product in a category.
     * @param group The category name.
     * @param name The product name.
     */
    groupProduct: (group: string, name: string): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}`,

    /** Gets or updates product review statuses. */
    productReviewStatuses: (): string => `${BASE}/products/review-statuses`,

    /**
     * Updates data for a product in a specific year.
     * @param group The category name.
     * @param name The product name.
     * @param year The data year.
     */
    productYear: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/years/${year}`,

    /**
     * Updates quantities for a product in a specific year.
     * @param group The category name.
     * @param name The product name.
     * @param year The data year.
     */
    productAmounts: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/years/${year}/amounts`,

    /** Moves amount rows to another product. */
    productAmountTransfers: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/years/${year}/amounts/transfers`,

    /**
     * Creates a quantity change record.
     * @param group The category name.
     * @param name The product name.
     * @param year The data year.
     */
    productAmountHistory: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/years/${year}/amount-history`,

    /**
     * Uploads or removes a product's primary image.
     * @param group The category name.
     * @param name The product name.
     */
    productImage: (group: string, name: string): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/image`,

    /**
     * Uploads or removes an image for one product variant.
     * @param group The category name.
     * @param name The product name.
     * @param variant The variant name.
     */
    productVariantImage: (group: string, name: string, variant: string): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/variants/${encodeURIComponent(variant)}/image`,

    /** Gets all variants. */
    variants: () => `${BASE}/variants`,

    /** Gets all products or creates a new product. */
    products: () => `${BASE}/products`,

    /** Gets summary data. */
    summary: () => `${BASE}/summary`,

    /** Downloads the latest data export archive. */
    exportLatest: () => `${BASE}/exports/latest`,

    /** Uploads a data import archive. */
    import: () => `${BASE}/imports`,

    /**
     * Gets change history for a product in a specific year.
     * @param group The category name.
     * @param name The product name.
     * @param year The data year.
     */
    productHistory: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/years/${year}/history`,

    /**
     * Gets summary history for a product in a specific year.
     * @param group The category name.
     * @param name The product name.
     * @param year The data year.
     */
    summaryHistory: (group: string, name: string, year: number): string =>
        `${BASE}/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/years/${year}/summary-history`,
} as const;
