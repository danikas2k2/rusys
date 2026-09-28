import { ActionIcon, Checkbox, Group } from '@mantine/core';
import { isEmpty } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import { CollapseIcon, ExpandIcon, RecycledIcon } from '@icons';

import type { Product, ProductAmounts as ProductAmountsType, RemovingYearAmounts, VariantAmount } from '~/common/data';
import { getCombinedAmounts } from '~/common/utils/amounts';
import { getExpiryStatus, getWorstExpiryStatus } from '~/common/utils/expiry';
import { AnnotatedTotalAmounts } from '~/components/amounts/AnnotatedTotalAmounts';
import { GridTile } from '~/components/common/GridTile';
import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { useLabels } from '~/lib/hooks/useLabels';
import { useSetProductMissing } from '~/store/products/useSetProductMissing';

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
    // Whether any descendant has a non-empty amount - an expanded parent with none of its own
    // amounts (totalAmounts excludes children once expanded) still isn't really "empty" when this
    // is true, since its children (shown separately below) do have something.
    hasNonEmptyDescendant?: boolean;
}

// The single year isPreferred() would pick out of `years` - falls back to the current year (with
// no own amounts yet) when nothing qualifies, same as starting a brand new annual product.
export function getPreferredYear(years: readonly RemovingYearAmounts[] | undefined): number {
    const thisYear = new Date().getFullYear() % 100;
    let maxOlderYear = -1;
    for (const y of years ?? []) {
        if (!y.amounts?.length || y.removing) {
            continue;
        }
        if (y.year < thisYear && y.year > maxOlderYear) {
            maxOlderYear = y.year;
        }
    }
    return maxOlderYear !== -1 ? maxOlderYear : thisYear;
}

function ProductTileComponent({
    product,
    annual = false,
    hidden = false,
    hasChildren = false,
    expanded = false,
    onToggleExpand,
    totalAmounts,
    hasNonEmptyDescendant = false,
}: ProductTileProps) {
    const _ = useLabels();
    const { group, name, years } = product;
    const available = !isEmpty(years);
    const hasRemovingYear = years?.some(({ removing }) => removing) ?? false;

    // A collapsed parent's tile only ever shows the rolled-up total (see totalAmounts) - opening
    // an edit dialog for it doesn't apply until it's expanded down to an individual product.
    const isSummaryTile = hasChildren && !expanded;

    const isEmptyTile = !totalAmounts.length && !(hasChildren && hasNonEmptyDescendant);
    const now = new Date().getTime();
    const expiryStatus = getWorstExpiryStatus(
        totalAmounts.map(({ expiresAt }) => getExpiryStatus(expiresAt, now, product.expiryToleranceDays))
    );

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
        <GridTile
            name={name}
            tileKind="product"
            image={product.image}
            photo={product.photo}
            onClick={handleClick}
            hidden={hidden}
            empty={isEmptyTile}
            leading={
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
            }
            headingAction={
                hasChildren && (
                    <IconButtonTooltip>
                        <ActionIcon
                            data-product-expand
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={handleToggleExpand}
                            aria-label={_(expanded ? 'Collapse' : 'Expand')}
                        >
                            {expanded ? <CollapseIcon size={16} /> : <ExpandIcon size={16} />}
                        </ActionIcon>
                    </IconButtonTooltip>
                )
            }
            amounts={
                totalAmounts.length > 0 && (
                    <AnnotatedTotalAmounts
                        group={group}
                        amounts={totalAmounts}
                        expiryToleranceDays={product.expiryToleranceDays}
                    />
                )
            }
            overlay={
                hasRemovingYear && (
                    <span data-removing-icon aria-label={_('Marked for removal')} title={_('Marked for removal')}>
                        <RecycledIcon size={16} />
                    </span>
                )
            }
            tileData={{
                'data-tile-kind': 'product',
                'data-summary': isSummaryTile,
                'data-expanded-parent': hasChildren && expanded,
                'data-removing': hasRemovingYear,
                'data-expiry': expiryStatus,
            }}
        />
    );
}

export const ProductTile = React.memo(ProductTileComponent);
