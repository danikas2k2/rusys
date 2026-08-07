import { collectDescendants } from '~/client/pages/products/utils/collectDescendants';
import { getId } from '~/client/utils/id';
import { combineProductYears, getCombinedAmounts } from '~/common/utils/amounts';
import type { Product, RemovingYearAmounts, VariantAmount } from '~/types/data';

export interface ProductGridNode {
    product: Product;
    hasChildren: boolean;
    expanded: boolean;
    children: readonly ProductGridNode[];
    // The tile's own amounts when a leaf, or its own + every descendant's (at any depth) when
    // collapsed with children - undefined once expanded, since children are shown separately.
    totalAmounts: readonly VariantAmount[];
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

            if (hasChildren && !expanded) {
                const descendants = collectDescendants(p.name, childrenByParent);
                return {
                    product: p,
                    hasChildren,
                    expanded,
                    children: [],
                    totalAmounts: getCleanTotal([p.years, ...descendants.map((d) => d.years)]),
                };
            }

            return {
                product: p,
                hasChildren,
                expanded,
                children: hasChildren ? build(childProducts) : [],
                totalAmounts: getCleanTotal([p.years]),
            };
        });

    return build(roots);
}
