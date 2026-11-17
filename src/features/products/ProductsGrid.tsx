import { Collapse, SimpleGrid } from '@mantine/core';
import React, { startTransition, useCallback, useEffect, useMemo, useState, ViewTransition } from 'react';

import { LoadableContent } from '~/components/common/LoadableContent';
import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useSortedGroups } from '~/features/groups/hooks/useSortedGroups';
import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useProductsHasData } from '~/features/products/hooks/useProductsHasData';
import { useMissingOnly } from '~/features/products/MissingOnlyContext';
import { ProductTile } from '~/features/products/ProductTile';
import { buildProductGridTree, type ProductGridNode } from '~/features/products/utils/buildProductGridTree';
import { getId } from '~/lib/utils/id';
import { prefersReducedMotion } from '~/lib/utils/motion';
import { useProducts } from '~/store/products';

import './ProductsGrid.css';

const GRID_COLS = { base: 1, sm: 2, lg: 3 };

interface ProductGridSectionProps {
    nodes: readonly ProductGridNode[];
    annual?: boolean;
    toggleHandlers: ReadonlyMap<string, () => void>;
    eagerInitialImages?: boolean;
}

function ProductGridSection({ nodes, annual, toggleHandlers, eagerInitialImages = false }: ProductGridSectionProps) {
    const sections = useMemo(() => {
        const result: ProductGridNode[][] = [];
        let section: ProductGridNode[] = [];
        for (const node of nodes) {
            section.push(node);
            // Full-width children interrupt the column flow; subsequent products start a new section.
            if (node.hasChildren && node.expanded) {
                result.push(section);
                section = [];
            }
        }
        if (section.length) {
            result.push(section);
        }
        return result;
    }, [nodes]);
    return (
        <div data-product-sections>
            {sections.map((section, sectionIndex) => {
                const rows = { sm: Math.ceil(section.length / 2), lg: Math.ceil(section.length / 3) };
                return (
                    <React.Fragment key={getId(section[0].product.group, section[0].product.name)}>
                        <SimpleGrid
                            cols={GRID_COLS}
                            spacing="0.5rem"
                            verticalSpacing={0}
                            style={{
                                '--product-grid-rows': section.length,
                                '--product-grid-rows-sm': rows.sm,
                                '--product-grid-rows-lg': rows.lg,
                            }}
                        >
                            {section.map((node, index) => (
                                <ViewTransition
                                    key={getId(node.product.group, node.product.name)}
                                    enter="product-tile-enter"
                                    exit="product-tile-exit"
                                    update={node.hasChildren ? 'grouped-product-update' : 'none'}
                                    default="none"
                                >
                                    <ProductTile
                                        product={node.product}
                                        gridIndex={index}
                                        gridRows={rows}
                                        imageLoading={
                                            eagerInitialImages && sectionIndex === 0 && index < 2 ? 'eager' : 'lazy'
                                        }
                                        annual={annual}
                                        hasChildren={node.hasChildren}
                                        expanded={node.expanded}
                                        onToggleExpand={toggleHandlers.get(
                                            getId(node.product.group, node.product.name)
                                        )}
                                        totalAmounts={node.totalAmounts}
                                        hasNonEmptyDescendant={node.hasNonEmptyDescendant}
                                    />
                                </ViewTransition>
                            ))}
                        </SimpleGrid>
                        {section
                            .filter((node) => node.hasChildren)
                            .map((node) => (
                                // Keep collapsed descendants mounted, outside the column flow.
                                <Collapse key={getId(node.product.group, node.product.name)} expanded={node.expanded}>
                                    <div data-children-panel>
                                        <ProductGridSection
                                            nodes={node.children}
                                            annual={annual}
                                            toggleHandlers={toggleHandlers}
                                        />
                                    </div>
                                </Collapse>
                            ))}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export function ProductsGrid() {
    const groups = useSortedGroups();
    const [selectedGroup] = useGroupFilter();
    const allProducts = useProducts();
    // Query refreshes use a synchronous external store. For membership changes, wait for
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
        const timeout = window.setTimeout(
            () => startTransition(() => setDisplayProducts(allProducts)),
            prefersReducedMotion() ? 0 : 220
        );
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
                    <ProductGridSection
                        nodes={nodes}
                        annual={annual}
                        toggleHandlers={toggleHandlers}
                        eagerInitialImages
                    />
                </div>
            </ViewTransition>
        </LoadableContent>
    );
}
