import { Center, SegmentedControl } from '@mantine/core';
import React from 'react';

import { GridViewIcon, TableViewIcon } from '@icons';

import { useProductsView, type ProductsView } from '~/client/common/ProductsViewContext';
import { useLabels } from '~/client/hooks/useLabels';

export function ProductsViewToggle() {
    const _ = useLabels();
    const [productsView, setProductsView] = useProductsView();

    const data = [
        {
            value: 'grid',
            label: (
                <Center>
                    <GridViewIcon size={20} aria-label={_('Tiles')} />
                </Center>
            ),
        },
        {
            value: 'table',
            label: (
                <Center>
                    <TableViewIcon size={20} aria-label={_('Table')} />
                </Center>
            ),
        },
    ];

    const handleChange = (value: string) => setProductsView(value as ProductsView);

    return (
        <SegmentedControl
            data-toggle="products-view"
            size="xs"
            color="primary"
            p="4 1"
            data={data}
            value={productsView}
            onChange={handleChange}
        />
    );
}
