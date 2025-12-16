import { Table } from '@mantine/core';
import React from 'react';

import { LoadableContent } from '~/client/common/LoadableContent';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { MissingOnlyCheckbox } from '~/client/pages/products/MissingOnlyCheckbox';
import { ProductsGroup } from '~/client/pages/products/ProductsGroup';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { useProducts } from '~/client/state/products/useProducts';
import { useYears } from '~/client/state/years/useYears';

export function ProductsTable() {
    const years = useYears();
    const groups = useSortedGroups();
    const products = useProducts();
    const headingWidth = 300 / (years.length + 3);

    return (
        <LoadableContent loader={useGetProducts()} hasData={useProductsHasData()}>
            <Table layout="fixed" data-table="products">
                <Table.Thead>
                    <Table.Tr h="3rem">
                        <Table.Th w={`${headingWidth}%`}>
                            <MissingOnlyCheckbox />
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
