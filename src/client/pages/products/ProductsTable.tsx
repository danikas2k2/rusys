import React, { useCallback, useEffect } from 'react';

import { Table } from '@mantine/core';

import { LoadableContent } from '~/client/common/LoadableContent';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useProductFilters } from '~/client/filters/hooks/useProductFilters';
import { useQuickFilterContext } from '~/client/filters/QuickFilterContext';
import { useSortedList } from '~/client/hooks/useSortedList';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { useMissingProducts } from '~/client/pages/products/hooks/useMissingProducts';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { MissingOnlyCheckbox } from '~/client/pages/products/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductsGroups } from '~/client/pages/products/ProductsGroups';
import { VisibleProductsProvider } from '~/client/pages/products/VisibleProductsContext';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { useProducts } from '~/client/state/products/useProducts';
import { useYears } from '~/client/state/years/useYears';

export function ProductsTable() {
    const filteredProducts = useFilteredList(useProducts(), useProductFilters());
    const hasFilteredProducts = !!filteredProducts.length;

    const [missingOnly, setMissingOnly] = useMissingOnly();
    const missingProducts = useMissingProducts(filteredProducts);
    const hasMissingProducts = !!missingProducts.length;

    useEffect(() => {
        if (missingOnly && !hasMissingProducts && hasFilteredProducts) {
            setMissingOnly(false);
        }
    }, [hasFilteredProducts, hasMissingProducts, missingOnly, setMissingOnly]);

    const [filter, setFilter] = useQuickFilterContext();
    const handleClick = useCallback(() => {
        if (missingOnly && filter && !hasMissingProducts) {
            setFilter('');
        }
    }, [filter, hasMissingProducts, missingOnly, setFilter]);

    const visibleProducts = useSortedList(missingOnly ? missingProducts : filteredProducts);
    const uniqueGroups = useUniqueGroups(visibleProducts);
    const group = useGroupFilter();
    const visibleGroups = group ? [group] : uniqueGroups;
    const years = useYears();
    const headingWidth = 300 / (years.length + 3);

    return (
        <LoadableContent loader={useGetProducts()} hasData={useProductsHasData()}>
            <VisibleProductsProvider products={visibleProducts}>
                <Table layout="fixed">
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
                    <ProductsGroups groups={visibleGroups} />
                </Table>
            </VisibleProductsProvider>
        </LoadableContent>
    );
}
