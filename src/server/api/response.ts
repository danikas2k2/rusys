import type { Product } from '@rusys/common/data';

import { getProducts } from '~/server/data/products';
import { getYears } from '~/server/data/years';

export async function getProductsWithYears() {
    const years = getYears();
    const products = await getProducts();
    return {
        products,
        years: products
            .reduce(
                (acc: number[], product: Product) => {
                    for (const { year } of product.years ?? []) {
                        if (year && !acc.includes(year)) {
                            acc.push(year);
                        }
                    }
                    return acc;
                },
                years.slice(0, 5)
            )
            .sort((a, b) => b - a),
    };
}
