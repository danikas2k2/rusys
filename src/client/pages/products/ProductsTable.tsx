import { Group, Table } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { AmountViewToggle } from '~/client/common/AmountViewToggle';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { MissingOnlyCheckbox } from '~/client/pages/products/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductRow } from '~/client/pages/products/ProductRow';
import { collectDescendants } from '~/client/pages/products/utils/collectDescendants';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { useProducts } from '~/client/state/products/useProducts';
import { useYears } from '~/client/state/years/useYears';
import { getId } from '~/client/utils/id';
import { combineProductYears } from '~/common/utils/amounts';
import type { Product, YearAmounts } from '~/types/data';

interface ProductTreeNode {
    product: Product;
    depth: number;
    hasChildren: boolean;
    expanded: boolean;
    rolledUpYears?: readonly YearAmounts[];
}

// Builds the visible (depth-first, respecting collapse) row list from the flat, already
// alphabetically-sorted `products` array, grouping by `parent`. A collapsed node with children
// gets a rolled-up total (its own amounts plus every descendant's, at any depth) for display.
function buildProductTree(products: readonly Product[], expandedIds: ReadonlySet<string>): ProductTreeNode[] {
    const childrenByParent = new Map<string, Product[]>();
    const roots: Product[] = [];
    for (const p of products) {
        if (p.parent) {
            childrenByParent.set(p.parent, [...(childrenByParent.get(p.parent) ?? []), p]);
        } else {
            roots.push(p);
        }
    }

    const nodes: ProductTreeNode[] = [];
    const walk = (list: readonly Product[], depth: number) => {
        for (const p of list) {
            const children = childrenByParent.get(p.name) ?? [];
            const hasChildren = children.length > 0;
            const expanded = expandedIds.has(getId(p.group, p.name));
            const descendants = hasChildren && !expanded ? collectDescendants(p.name, childrenByParent) : undefined;
            const rolledUpYears = descendants
                ? combineProductYears([p.years, ...descendants.map((d) => d.years)])
                : undefined;
            nodes.push({ product: p, depth, hasChildren, expanded, rolledUpYears });
            if (hasChildren && expanded) {
                walk(children, depth + 1);
            }
        }
    };
    walk(roots, 0);
    return nodes;
}

export function ProductsTable() {
    const years = useYears();
    const groups = useSortedGroups();
    const [selectedGroup] = useGroupFilter();
    const allProducts = useProducts();
    const products = useMemo(() => allProducts.filter((p) => p.group === selectedGroup), [allProducts, selectedGroup]);
    const quickFilter = useQuickFilterPredicate();
    const [missingOnly] = useMissingOnly();
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());

    const annual = groups.find((g) => g.group === selectedGroup)?.annual;
    const headingWidth = annual ? 300 / (years.length + 3) : 50;

    const nodes = useMemo(() => buildProductTree(products, expandedIds), [products, expandedIds]);

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

    // ProductRow is memoized, so each row needs a stable (same-reference-across-renders)
    // onToggleExpand — an inline `() => handleToggleExpand(id)` per row would recreate that prop
    // on every render and defeat the memo for every row, every time. Rebuilding this map only
    // when `nodes` itself changes keeps it stable across unrelated re-renders (e.g. quick-filter
    // keystrokes), just like the ids it covers.
    const toggleHandlers = useMemo(() => {
        const map = new Map<string, () => void>();
        for (const { product: p } of nodes) {
            const id = getId(p.group, p.name);
            map.set(id, () => handleToggleExpand(id));
        }
        return map;
    }, [nodes, handleToggleExpand]);

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
                    {nodes.map(({ product: p, depth, hasChildren, expanded, rolledUpYears }) => {
                        const id = getId(p.group, p.name);
                        return (
                            <ProductRow
                                key={id}
                                product={p}
                                annual={annual}
                                hidden={(missingOnly && !p.missing) || !quickFilter(p.name)}
                                depth={depth}
                                hasChildren={hasChildren}
                                expanded={expanded}
                                onToggleExpand={toggleHandlers.get(id)}
                                rolledUpYears={rolledUpYears}
                            />
                        );
                    })}
                </Table.Tbody>
            </Table>
        </LoadableContent>
    );
}
