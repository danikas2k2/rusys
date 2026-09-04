import type { Product, RemovingYearAmounts, VariantAmount } from '@rusys/common/data';
import { combineProductYears, getCombinedAmounts } from '@rusys/common/utils/amounts';

import { collectDescendants } from '~/client/pages/products/utils/collectDescendants';
import { getId } from '~/client/utils/id';

export interface ProductGridNode {
    product: Product;
    hasChildren: boolean;
    expanded: boolean;
    // Always built, even while collapsed - the grid keeps a collapsed parent's children mounted
    // (just visually hidden via an animated Collapse) so expanding/collapsing can animate smoothly
    // instead of the subtree mounting and unmounting on every toggle.
    children: readonly ProductGridNode[];
    // The tile's own amounts when a leaf or expanded, or its own + every descendant's (at any
    // depth) while collapsed with children.
    totalAmounts: readonly VariantAmount[];
    // Whether any descendant (at any depth) has a non-empty amount - lets an expanded parent tile
    // with none of its own amounts avoid reading as "empty" when its children (shown separately,
    // not rolled into totalAmounts) actually have some.
    hasNonEmptyDescendant: boolean;
}

// A product being phased out ("removing") shouldn't count toward the tile's summary total -
// unlike the table, which keeps every year for its per-year columns.
function excludeRemoving(years: readonly RemovingYearAmounts[] | undefined) {
    return years?.filter((y) => !y.removing);
}

function getCleanTotal(
    productsYears: readonly (readonly RemovingYearAmounts[] | undefined)[]
): readonly VariantAmount[] {
    const combinedYears = combineProductYears(productsYears.map(excludeRemoving));
    return getCombinedAmounts(combinedYears) ?? [];
}

// Builds a recursive parent/children tree (unlike the table's flat, depth-indented rows) from the
// flat, already alphabetically-sorted `products` array, so the grid can nest a collapsed parent's
// rolled-up total tile above an inset sub-grid of its children once expanded.
export function buildProductGridTree(
    products: readonly Product[],
    expandedIds: ReadonlySet<string>
): readonly ProductGridNode[] {
    const childrenByParent = new Map<string, Product[]>();
    const roots: Product[] = [];
    for (const p of products) {
        if (p.parent) {
            childrenByParent.set(p.parent, [...(childrenByParent.get(p.parent) ?? []), p]);
        } else {
            roots.push(p);
        }
    }

    const build = (list: readonly Product[]): ProductGridNode[] =>
        list.map((p) => {
            const childProducts = childrenByParent.get(p.name) ?? [];
            const hasChildren = childProducts.length > 0;
            const expanded = !hasChildren || expandedIds.has(getId(p.group, p.name));
            const descendants = hasChildren ? collectDescendants(p.name, childrenByParent) : [];
            const hasNonEmptyDescendant = getCleanTotal(descendants.map((d) => d.years)).length > 0;

            return {
                product: p,
                hasChildren,
                expanded,
                children: hasChildren ? build(childProducts) : [],
                totalAmounts: expanded
                    ? getCleanTotal([p.years])
                    : getCleanTotal([p.years, ...descendants.map((d) => d.years)]),
                hasNonEmptyDescendant,
            };
        });

    return build(roots);
}
