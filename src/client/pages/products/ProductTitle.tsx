import { ActionIcon, Checkbox, Group, Table, Title } from '@mantine/core';
import { isEmpty } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import { CollapseIcon, ExpandIcon } from '@icons';

import { useLabels } from '~/client/hooks/useLabels';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { useYears } from '~/client/state/years/useYears';
import type { Product } from '~/types/data';

interface ProductTitleProps {
    product: Product;
    depth?: number;
    hasChildren?: boolean;
    expanded?: boolean;
    onToggleExpand?: () => void;
}

export function ProductTitle({
    product,
    depth = 0,
    hasChildren = false,
    expanded = false,
    onToggleExpand,
}: ProductTitleProps): React.ReactElement {
    const _ = useLabels();
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
            <Group gap={4} wrap="nowrap" style={{ paddingInlineStart: depth * 16 }}>
                {hasChildren && (
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => onToggleExpand?.()}
                        aria-label={expanded ? _('Collapse') : _('Expand')}
                    >
                        {expanded ? <CollapseIcon size={16} /> : <ExpandIcon size={16} />}
                    </ActionIcon>
                )}
                <Checkbox
                    variant="outline"
                    checked={!product.missing}
                    disabled={!available}
                    indeterminate={!available}
                    onChange={handleClick}
                    label={
                        <Group gap="xs">
                            <Title order={5} data-available={available} data-removing={available && hasRemoving}>
                                {product.name}
                            </Title>
                        </Group>
                    }
                />
            </Group>
        </Table.Td>
    );
}
