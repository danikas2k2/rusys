import { ActionIcon, Avatar, Card, Checkbox, Group, Stack, Text } from '@mantine/core';
import { isEmpty } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import { CollapseIcon, ExpandIcon } from '@icons';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { useLabels } from '~/client/hooks/useLabels';
import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import { getPreferredYear } from '~/client/pages/products/ProductCell';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { getCombinedAmounts } from '~/common/utils/amounts';
import type { Product, ProductAmounts as ProductAmountsType, VariantAmount } from '~/types/data';

import './ProductTile.pcss';

export interface ProductTileProps {
    product: Product;
    annual?: boolean;
    hidden?: boolean;
    hasChildren?: boolean;
    expanded?: boolean;
    onToggleExpand?: () => void;
    // The tile's own amounts when a leaf or expanded, or a rolled-up total (own + every
    // descendant's) while collapsed with children - display-only, never the edit target.
    totalAmounts: readonly VariantAmount[];
}

function ProductTileComponent({
    product,
    annual = false,
    hidden = false,
    hasChildren = false,
    expanded = false,
    onToggleExpand,
    totalAmounts,
}: ProductTileProps) {
    const _ = useLabels();
    const { group, name, years } = product;
    const available = !isEmpty(years);

    // A collapsed parent's tile only ever shows the rolled-up total (see totalAmounts) - opening
    // an edit dialog for it doesn't apply until it's expanded down to an individual product.
    const isSummaryTile = hasChildren && !expanded;

    // A near-square, icon-sized image sits next to the title; anything bigger/wider is a photo
    // and becomes the tile's background instead - classified server-side, see classifyImage.
    const isPhoto = !!product.photo;
    const isIcon = !!product.image && !isPhoto;

    // Annual groups have no single "current" amounts field - the same year isPreferred() would
    // highlight in the table is what a tap opens here, since there's no year column to pick from.
    const year = annual ? getPreferredYear(years) : 0;
    const ownAmounts = useMemo(
        () => (year ? years?.find((y) => y.year === year)?.amounts : getCombinedAmounts(years)) ?? [],
        [year, years]
    );

    const setActive = useSetActiveContent<ProductAmountsType>();
    const setMissing = useSetProductMissing();

    const handleClick = useCallback(() => {
        if (isSummaryTile) {
            onToggleExpand?.();
            return;
        }
        setActive({
            action: 'values',
            data: { group, name, year, amounts: ownAmounts, image: product.image, photo: product.photo },
        });
    }, [isSummaryTile, onToggleExpand, setActive, group, name, year, ownAmounts, product.image, product.photo]);

    const handleToggleExpand = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onToggleExpand?.();
        },
        [onToggleExpand]
    );

    const handleMissingChange = useCallback(async () => {
        if (available) {
            await setMissing(group, name, !product.missing);
        }
    }, [available, setMissing, group, name, product.missing]);

    return (
        <Card
            withBorder
            padding="sm"
            radius="md"
            onClick={handleClick}
            data-tile="product"
            data-hidden={hidden}
            data-summary={isSummaryTile}
            data-expanded-parent={hasChildren && expanded}
            data-photo={isPhoto}
            data-empty={!totalAmounts.length}
            style={isPhoto ? { backgroundImage: `url(${product.photo})` } : undefined}
        >
            {isPhoto && <div data-scrim />}
            <Stack gap={6} data-content h="100%" justify="space-between">
                <Group justify="space-between" wrap="nowrap" gap={6} align="flex-start">
                    <Stack gap={4} align="center" style={{ flexShrink: 0 }}>
                        <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                                variant="outline"
                                size="sm"
                                checked={!product.missing}
                                disabled={!available}
                                indeterminate={!available}
                                onChange={handleMissingChange}
                                aria-label={_(product.missing ? 'Mark as available' : 'Mark as missing')}
                            />
                        </Group>
                        {isIcon && (
                            <Avatar src={product.image} radius="sm" size={24} alt="">
                                {name.trim().charAt(0).toUpperCase()}
                            </Avatar>
                        )}
                    </Stack>
                    <Text fw={600} lineClamp={2} style={{ flex: 1, minWidth: 0 }}>
                        {name}
                    </Text>
                    {hasChildren && (
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={handleToggleExpand}
                            aria-label={_(expanded ? 'Collapse' : 'Expand')}
                            style={isPhoto ? { color: '#fff' } : undefined}
                        >
                            {expanded ? <CollapseIcon size={16} /> : <ExpandIcon size={16} />}
                        </ActionIcon>
                    )}
                </Group>
                <Group justify="flex-end">
                    {totalAmounts.length ? (
                        <ProductAmounts group={group} amounts={totalAmounts} />
                    ) : (
                        <Text size="sm" c="dimmed">
                            —
                        </Text>
                    )}
                </Group>
            </Stack>
        </Card>
    );
}

export const ProductTile = React.memo(ProductTileComponent);
