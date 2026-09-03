import type {
    ApiGroups,
    ApiProductsWithGroups,
    ApiProductsWithVariants,
    ApiProductsWithYears,
    ApiVariants,
    ApiVariantsWithGroups,
} from '@rusys/common/api';
import type { Product } from '@rusys/common/data';

import { getGroups } from '~/server/data/groups';
import { getProducts } from '~/server/data/products';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';

export async function getProductsWithYears(): Promise<ApiProductsWithYears> {
    const years = getYears();
    const products = await getProducts();
    return {
        products,
        years: products
            .reduce(
                (acc: number[], d: Product) => {
                    if (d.years) {
                        for (const dy of d.years) {
                            if (dy.year && !acc.includes(dy.year)) {
                                acc.push(dy.year);
                            }
                        }
                    }
                    return acc;
                },
                years.slice(0, 5)
            )
            .sort((a, b) => b - a),
    };
}

export const getGroupsResponse = async (): Promise<ApiGroups> => ({ groups: await getGroups() });

export const getVariantsResponse = async (): Promise<ApiVariants> => ({ variants: await getVariants() });

export const getProductsWithVariants = async (): Promise<ApiProductsWithVariants> => ({
    ...(await getProductsWithYears()),
    ...(await getVariantsResponse()),
});

export const getProductsWithGroups = async (): Promise<ApiProductsWithGroups> => ({
    ...(await getProductsWithVariants()),
    ...(await getGroupsResponse()),
});

export const getVariantsWithGroups = async (): Promise<ApiVariantsWithGroups> => ({
    ...(await getVariantsResponse()),
    ...(await getGroupsResponse()),
});
