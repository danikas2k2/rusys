import { SimpleGrid } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { LoadableContent } from '~/client/common/LoadableContent';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductTile } from '~/client/pages/products/ProductTile';
import { buildProductGridTree, type ProductGridNode } from '~/client/pages/products/utils/buildProductGridTree';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { useProducts } from '~/client/state/products/useProducts';
import { getId } from '~/client/utils/id';
import type { Product } from '~/types/data';

import './ProductsGrid.pcss';

const GRID_COLS = { base: 2, xs: 3, sm: 4, md: 5, lg: 6 };
const GRID_SPACING = 'xs';

interface ProductGridSectionProps {
    nodes: readonly ProductGridNode[];
    annual?: boolean;
    isHidden: (product: Product) => boolean;
    toggleHandlers: ReadonlyMap<string, () => void>;
}

function ProductGridSection({ nodes, annual, isHidden, toggleHandlers }: ProductGridSectionProps) {
    return (
        <SimpleGrid cols={GRID_COLS} spacing={GRID_SPACING}>
            {nodes.map((node) => {
                const id = getId(node.product.group, node.product.name);
                return (
                    <React.Fragment key={id}>
                        <ProductTile
                            product={node.product}
                            annual={annual}
                            hidden={isHidden(node.product)}
                            hasChildren={node.hasChildren}
                            expanded={node.expanded}
                            onToggleExpand={toggleHandlers.get(id)}
                            totalAmounts={node.totalAmounts}
                            hasNonEmptyDescendant={node.hasNonEmptyDescendant}
                        />
                        {node.expanded && node.hasChildren && (
                            // Bordered so it's visually obvious which tiles belong to the parent
                            // just expanded above, rather than reading as an unrelated next row.
                            <div data-children-panel style={{ gridColumn: '1 / -1' }}>
                                <ProductGridSection
                                    nodes={node.children}
                                    annual={annual}
                                    isHidden={isHidden}
                                    toggleHandlers={toggleHandlers}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </SimpleGrid>
    );
}

export function ProductsGrid() {
    const groups = useSortedGroups();
    const [selectedGroup] = useGroupFilter();
    const allProducts = useProducts();
    const products = useMemo(() => allProducts.filter((p) => p.group === selectedGroup), [allProducts, selectedGroup]);
    const quickFilter = useQuickFilterPredicate();
    const [missingOnly] = useMissingOnly();
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());

    const annual = groups.find((g) => g.group === selectedGroup)?.annual;

    const nodes = useMemo(() => buildProductGridTree(products, expandedIds), [products, expandedIds]);

    const handleToggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // See ProductsTable's identical comment: ProductTile is memoized, so every tile needs a
    // stable, same-reference-across-renders onToggleExpand handler.
    const toggleHandlers = useMemo(() => {
        const map = new Map<string, () => void>();
        const walk = (list: readonly ProductGridNode[]) => {
            for (const n of list) {
                const id = getId(n.product.group, n.product.name);
                map.set(id, () => handleToggleExpand(id));
                if (n.expanded) {
                    walk(n.children);
                }
            }
        };
        walk(nodes);
        return map;
    }, [nodes, handleToggleExpand]);

    const isHidden = useCallback(
        (product: Product) => (missingOnly && !product.missing) || !quickFilter(product.name),
        [missingOnly, quickFilter]
    );

    return (
        <LoadableContent loader={useGetProducts()} hasData={useProductsHasData()}>
            <div data-grid="products">
                <ProductGridSection nodes={nodes} annual={annual} isHidden={isHidden} toggleHandlers={toggleHandlers} />
            </div>
        </LoadableContent>
    );
}
