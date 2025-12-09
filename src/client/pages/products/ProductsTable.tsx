import React, { useCallback, useEffect } from 'react';

import { Table } from '@mantine/core';

import { LoadableContent } from '~/client/common/LoadableContent';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useProductFilters } from '~/client/filters/hooks/useProductFilters';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { MissingOnlyCheckbox } from '~/client/pages/products/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductsGroup } from '~/client/pages/products/ProductsGroup';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { useProducts } from '~/client/state/products/useProducts';
import { useYears } from '~/client/state/years/useYears';

export function ProductsTable() {
    const products = useProducts();
    const groups = useSortedGroups();

    const filteredProducts = useFilteredList(products, useProductFilters());
    const hasFilteredProducts = !!filteredProducts.length;

    const [missingOnly, setMissingOnly] = useMissingOnly();
    const hasMissingProducts = filteredProducts.some((v) => v.missing);

    useEffect(() => {
        if (missingOnly && !hasMissingProducts && hasFilteredProducts) {
            setMissingOnly(false);
        }
    }, [hasFilteredProducts, hasMissingProducts, missingOnly, setMissingOnly]);

    const [filter, setFilter] = useQuickFilter();
    const handleClick = useCallback(() => {
        if (missingOnly && filter && !hasMissingProducts) {
            setFilter('');
        }
    }, [filter, hasMissingProducts, missingOnly, setFilter]);

    const years = useYears();
    const headingWidth = 300 / (years.length + 3);

    return (
        <LoadableContent loader={useGetProducts()} hasData={useProductsHasData()}>
            <Table layout="fixed" data-table="products">
                <Table.Thead>
                    <Table.Tr h="3rem">
                        <Table.Th w={`${headingWidth}%`}>
                            <MissingOnlyCheckbox onClick={handleClick} />
                        </Table.Th>
                        {years.map((year) => (
                            <Table.Th key={year} ta="center">
                                {year}
                            </Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                {groups.map((g) => (
                    <ProductsGroup key={g.group} group={g} products={products} />
                ))}
            </Table>
        </LoadableContent>
    );
}
