import { Collapse, SimpleGrid } from '@mantine/core';
import React, { startTransition, useCallback, useEffect, useMemo, useState, ViewTransition } from 'react';

import { LoadableContent } from '~/components/common/LoadableContent';
import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useSortedGroups } from '~/features/groups/hooks/useSortedGroups';
import { useProductsHasData } from '~/features/products/hooks/useProductsHasData';
import { useMissingOnly } from '~/features/products/MissingOnlyContext';
import { ProductTile } from '~/features/products/ProductTile';
import { buildProductGridTree, type ProductGridNode } from '~/features/products/utils/buildProductGridTree';
import { getId } from '~/lib/utils/id';
import { useGetProducts } from '~/store/products/useGetProducts';
import { useProducts } from '~/store/products/useProducts';

import './ProductsGrid.css';

const GRID_COLS = { base: 2, xs: 3, sm: 4, md: 5, lg: 6 };
const GRID_SPACING = 'xs';

interface ProductGridSectionProps {
    nodes: readonly ProductGridNode[];
    annual?: boolean;
    toggleHandlers: ReadonlyMap<string, () => void>;
}

function ProductGridSection({ nodes, annual, toggleHandlers }: ProductGridSectionProps) {
    return (
        <SimpleGrid cols={GRID_COLS} spacing={GRID_SPACING}>
            {nodes.map((node) => {
                const id = getId(node.product.group, node.product.name);
                const tile = (
                    <ProductTile
                        product={node.product}
                        annual={annual}
                        hasChildren={node.hasChildren}
                        expanded={node.expanded}
                        onToggleExpand={toggleHandlers.get(id)}
                        totalAmounts={node.totalAmounts}
                        hasNonEmptyDescendant={node.hasNonEmptyDescendant}
                    />
                );
                return (
                    <React.Fragment key={id}>
                        <ViewTransition
                            enter="product-tile-enter"
                            exit="product-tile-exit"
                            update={node.hasChildren ? 'grouped-product-update' : 'none'}
                            default="none"
                        >
                            {tile}
                        </ViewTransition>
                        {node.hasChildren && (
                            // Children stay mounted (see ProductGridNode.children) so this can
                            // animate the height smoothly instead of the panel just appearing/
                            // disappearing. Bordered so it's visually obvious which tiles belong
                            // to the parent above, rather than reading as an unrelated next row.
                            <Collapse expanded={node.expanded} style={{ gridColumn: '1 / -1' }}>
                                <div data-children-panel>
                                    <ProductGridSection
                                        nodes={node.children}
                                        annual={annual}
                                        toggleHandlers={toggleHandlers}
                                    />
                                </div>
                            </Collapse>
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
    // Redux refreshes use a synchronous external store. For membership changes, wait for
    // the 200ms Mantine dialog exit to finish before starting the card transition;
    // otherwise its focus/portal flush can cancel React's snapshot. Amount updates stay immediate.
    const [displayProducts, setDisplayProducts] = useState(allProducts);
    useEffect(() => {
        if (displayProducts === allProducts) {
            return;
        }
        const displayedIds = new Set(displayProducts.map((product) => getId(product.group, product.name)));
        const membershipChanged =
            displayedIds.size !== allProducts.length ||
            allProducts.some((product) => !displayedIds.has(getId(product.group, product.name)));
        if (!membershipChanged) {
            const frame = requestAnimationFrame(() => setDisplayProducts(allProducts));
            return () => cancelAnimationFrame(frame);
        }
        const timeout = window.setTimeout(() => startTransition(() => setDisplayProducts(allProducts)), 220);
        return () => window.clearTimeout(timeout);
    }, [allProducts, displayProducts]);
    const quickFilter = useQuickFilterPredicate();
    const [missingOnly] = useMissingOnly();
    const products = useMemo(
        () =>
            displayProducts.filter(
                (p) => p.group === selectedGroup && (!missingOnly || p.missing) && quickFilter(p.name)
            ),
        [displayProducts, selectedGroup, missingOnly, quickFilter]
    );
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());

    const annual = groups.find((g) => g.group === selectedGroup)?.annual;

    const nodes = useMemo(() => buildProductGridTree(products, expandedIds), [products, expandedIds]);

    const handleToggleExpand = useCallback((id: string) => {
        startTransition(() => {
            setExpandedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        });
    }, []);

    // ProductTile is memoized, so every tile needs a
    // stable, same-reference-across-renders onToggleExpand handler.
    const toggleHandlers = useMemo(() => {
        const map = new Map<string, () => void>();
        const walk = (list: readonly ProductGridNode[]) => {
            for (const n of list) {
                const id = getId(n.product.group, n.product.name);
                map.set(id, () => handleToggleExpand(id));
                walk(n.children);
            }
        };
        walk(nodes);
        return map;
    }, [nodes, handleToggleExpand]);

    return (
        <LoadableContent resourceKey="products" loader={useGetProducts()} hasData={useProductsHasData()}>
            <ViewTransition update="missing-products-update" default="none">
                <div data-grid="products">
                    <ProductGridSection nodes={nodes} annual={annual} toggleHandlers={toggleHandlers} />
                </div>
            </ViewTransition>
        </LoadableContent>
    );
}
