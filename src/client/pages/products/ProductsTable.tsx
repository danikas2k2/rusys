import { Group, Table } from '@mantine/core';
import React from 'react';

import { AmountViewToggle } from '~/client/common/AmountViewToggle';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { MissingOnlyCheckbox } from '~/client/pages/products/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductRow } from '~/client/pages/products/ProductRow';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { useProducts } from '~/client/state/products/useProducts';
import { useYears } from '~/client/state/years/useYears';
import { getId } from '~/client/utils/id';

export function ProductsTable() {
    const years = useYears();
    const groups = useSortedGroups();
    const [selectedGroup] = useGroupFilter();
    const products = useProducts().filter((p) => p.group === selectedGroup);
    const quickFilter = useQuickFilterPredicate();
    const [missingOnly] = useMissingOnly();

    const annual = groups.find((g) => g.group === selectedGroup)?.annual;
    const headingWidth = annual ? 300 / (years.length + 3) : 50;

    return (
        <LoadableContent loader={useGetProducts()} hasData={useProductsHasData()}>
            <Table layout="fixed" data-table="products">
                <Table.Thead>
                    <Table.Tr h="3rem">
                        <Table.Th w={`${headingWidth}%`}>
                            <Group gap="xs" wrap="nowrap">
                                <MissingOnlyCheckbox />
                                <AmountViewToggle />
                            </Group>
                        </Table.Th>
                        {annual ? (
                            years.map((year) => (
                                <Table.Th key={year} ta="center">
                                    {year}
                                </Table.Th>
                            ))
                        ) : (
                            <Table.Th ta="center" />
                        )}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {products.map((p) => (
                        <ProductRow
                            key={getId(p.group, p.name)}
                            product={p}
                            annual={annual}
                            hidden={(missingOnly && !p.missing) || !quickFilter(p.name)}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </LoadableContent>
    );
}
