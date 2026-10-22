export const BASE = '/api/v1';

export const API = {
    /**
     * Updates or renames one category.
     * @param group The category name.
     */
    group: (group: string): string => `${BASE}/groups/${encodeURIComponent(group)}`,

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

    /** Uploads a data import archive. */
    import: () => `${BASE}/imports`,
} as const;
