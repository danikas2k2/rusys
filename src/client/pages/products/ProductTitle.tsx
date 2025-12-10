import React, { useCallback, useMemo } from 'react';

import { Checkbox, Table, Title } from '@mantine/core';
import { isEmpty } from 'lodash';

import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { useYears } from '~/client/state/years/useYears';
import type { Product } from '~/types/data';

interface ProductTitleProps {
    product: Product;
}

export function ProductTitle({ product }: ProductTitleProps): React.ReactElement {
    const available = !isEmpty(product.years);

    const allYears = useYears();
    const hasRemoving = useMemo(
        () => product.years?.some((y) => y.removing && allYears.includes(y.year)) ?? false,
        [allYears, product.years]
    );

    const setMissing = useSetProductMissing();
    const handleClick = useCallback(async (): Promise<void> => {
        if (available) {
            await setMissing(product.group, product.name, !product.missing);
        }
    }, [available, setMissing, product.group, product.name, product.missing]);

    return (
        <Table.Td>
            <Checkbox
                variant="outline"
                checked={!product.missing}
                disabled={!available}
                indeterminate={!available}
                onChange={handleClick}
                label={
                    <Title order={5} data-available={available} data-removing={available && hasRemoving}>
                        {product.name}
                    </Title>
                }
            />
        </Table.Td>
    );
}
