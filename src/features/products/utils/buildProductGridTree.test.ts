import type { Product } from '@rusys/common/data';

import { buildProductGridTree } from '~/features/products/utils/buildProductGridTree';

describe('buildProductGridTree', () => {
    it('builds a leaf node for a product with no parent and no children', () => {
        const product: Product = {
            group: 'Uogienės',
            name: 'Avietės',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
        };

        const [node] = buildProductGridTree([product], new Set());

        expect(node).toStrictEqual(
            expect.objectContaining({
                product,
                hasChildren: false,
                expanded: true,
                children: [],
                totalAmounts: [{ variant: 'p', amount: 2 }],
            })
        );
    });

    it('collapses a parent with children into a single node with a rolled-up total, children still built', () => {
        const parent: Product = {
            group: 'Uogienės',
            name: 'Avietės',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
        };
        const child: Product = {
            group: 'Uogienės',
            name: 'Avietės (Zewa)',
            parent: 'Avietės',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 3 }] }],
        };

        const [node] = buildProductGridTree([parent, child], new Set());

        expect(node).toStrictEqual(
            expect.objectContaining({
                product: parent,
                hasChildren: true,
                expanded: false,
                totalAmounts: [{ variant: 'p', amount: 5 }],
            })
        );
        // Not rendered while collapsed (ProductTile ignores a parent's own `children` prop, using
        // totalAmounts instead), but still built so expanding can animate instead of the child
        // tile just appearing.
        expect(node.children).toHaveLength(1);
        expect(node.children[0]).toStrictEqual(expect.objectContaining({ product: child }));
    });

    it('reveals the child as its own node once expanded, and stops rolling up the parent', () => {
        const parent: Product = {
            group: 'Uogienės',
            name: 'Avietės',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
        };
        const child: Product = {
            group: 'Uogienės',
            name: 'Avietės (Zewa)',
            parent: 'Avietės',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 3 }] }],
        };

        const [node] = buildProductGridTree([parent, child], new Set(['Uogienės:Avietės']));

        expect(node).toStrictEqual(
            expect.objectContaining({
                product: parent,
                hasChildren: true,
                expanded: true,
                totalAmounts: [{ variant: 'p', amount: 2 }],
            })
        );
        expect(node.children).toHaveLength(1);
        expect(node.children[0]).toStrictEqual(
            expect.objectContaining({ product: child, hasChildren: false, expanded: true })
        );
    });

    it('flags hasNonEmptyDescendant when an expanded child has an amount', () => {
        const parent: Product = { group: 'Uogienės', name: 'Avietės', years: [] };
        const child: Product = {
            group: 'Uogienės',
            name: 'Avietės (Zewa)',
            parent: 'Avietės',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 3 }] }],
        };

        const [node] = buildProductGridTree([parent, child], new Set(['Uogienės:Avietės']));

        expect(node.totalAmounts).toStrictEqual([]);
        expect(node.hasNonEmptyDescendant).toBe(true);
    });

    it('does not flag hasNonEmptyDescendant when every child is empty', () => {
        const parent: Product = { group: 'Uogienės', name: 'Avietės', years: [] };
        const child: Product = { group: 'Uogienės', name: 'Avietės (Zewa)', parent: 'Avietės', years: [] };

        const [node] = buildProductGridTree([parent, child], new Set(['Uogienės:Avietės']));

        expect(node.hasNonEmptyDescendant).toBe(false);
    });

    it('does not flag hasNonEmptyDescendant for a leaf with no children', () => {
        const product: Product = { group: 'Uogienės', name: 'Avietės', years: [] };

        const [node] = buildProductGridTree([product], new Set());

        expect(node.hasNonEmptyDescendant).toBe(false);
    });

    it('excludes removing years from the leaf total', () => {
        const product: Product = {
            group: 'Uogienės',
            name: 'Avietės',
            years: [
                { year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true },
                { year: 22, amounts: [{ variant: 'p', amount: 3 }] },
            ],
        };

        const [node] = buildProductGridTree([product], new Set());

        expect(node.totalAmounts).toStrictEqual([{ variant: 'p', amount: 3 }]);
    });

    it('excludes removing years from the collapsed parent rollup, including descendants', () => {
        const parent: Product = {
            group: 'Uogienės',
            name: 'Avietės',
            years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
        };
        const child: Product = {
            group: 'Uogienės',
            name: 'Avietės (Zewa)',
            parent: 'Avietės',
            years: [
                { year: 21, amounts: [{ variant: 'p', amount: 1 }], removing: true },
                { year: 22, amounts: [{ variant: 'p', amount: 3 }] },
            ],
        };

        const [node] = buildProductGridTree([parent, child], new Set());

        expect(node.totalAmounts).toStrictEqual([{ variant: 'p', amount: 3 }]);
    });

    it('rolls up a grandchild into the collapsed grandparent total', () => {
        const grandparent: Product = { group: 'Uogienės', name: 'A', years: [] };
        const parent: Product = { group: 'Uogienės', name: 'B', parent: 'A', years: [] };
        const grandchild: Product = {
            group: 'Uogienės',
            name: 'C',
            parent: 'B',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 4 }] }],
        };

        const [node] = buildProductGridTree([grandparent, parent, grandchild], new Set());

        expect(node.totalAmounts).toStrictEqual([{ variant: 'p', amount: 4 }]);
    });

    it('returns one root node per top-level product', () => {
        const a: Product = { group: 'g', name: 'A', years: [] };
        const b: Product = { group: 'g', name: 'B', years: [] };

        const nodes = buildProductGridTree([a, b], new Set());

        expect(nodes.map((n) => n.product.name)).toStrictEqual(['A', 'B']);
    });
});
