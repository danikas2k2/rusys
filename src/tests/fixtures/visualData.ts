import type { InitialAppData, InitialResource } from '~/components/app/initialData';
import { Links } from '~/lib/links';
import type { Group, Product, ProductHistory, Summary, Variant } from '~/schema';
import { getYears } from '~/server/data/years';
import { createScenarioData, currentYear, type Scenario } from '~/tests/fixtures/data';

function visualVariants(variants: Variant[]): Variant[] {
    return variants
        .map((variant) => ({ ...variant, used: variant.variant !== 'Didelis indelis' }))
        .toSorted((a, b) => a.group.localeCompare(b.group) || a.order - b.order);
}

function visualProducts(products: Product[]): Product[] {
    return products
        .map((product) => ({
            ...product,
            historyYears: Array.from(
                new Set(
                    [...(product.updates ?? []), ...(product.undates ?? [])].flatMap((entry) =>
                        entry.years.map(({ year }) => year)
                    )
                )
            ),
        }))
        .toSorted((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}

function visualSummary(scenario: Scenario, products: Product[]): Summary[] {
    if (scenario !== 'history' && scenario !== 'history-images' && scenario !== 'consumed-recycled') {
        return [];
    }
    const avietes = products.find(({ name }) => name === 'Avietės');
    return [
        {
            group: 'Uogienės',
            name: 'Avietės',
            years: [
                {
                    year: currentYear,
                    amounts:
                        scenario === 'consumed-recycled'
                            ? [
                                  { variant: 'Stiklainis', amount: 1, recycled: false },
                                  { variant: 'Stiklainis', amount: 1, recycled: true },
                              ]
                            : [{ variant: 'Stiklainis', amount: 1, recycled: false }],
                },
            ],
            ...(avietes?.image && { image: avietes.image }),
        },
    ];
}

export function getVisualAppData(
    pathname: string,
    scenario: Scenario
): {
    data: InitialAppData;
    resource: InitialResource;
    initialGroup?: string;
} {
    const { groups, variants, products } = createScenarioData(scenario);
    const initialGroup = groups[0]?.group;
    if (pathname === Links.CATEGORIES) {
        return { data: { groups }, resource: 'groups', initialGroup };
    }
    if (pathname === Links.VARIANTS) {
        return { data: { groups, variants: visualVariants(variants) }, resource: 'variants', initialGroup };
    }
    if (pathname === Links.SUMMARY) {
        return {
            data: {
                years: getYears(3, 8),
                groups,
                variants: visualVariants(variants),
                summary: visualSummary(scenario, products),
            },
            resource: 'summary',
            initialGroup,
        };
    }
    const years = getYears();
    for (const product of products) {
        for (const { year } of product.years ?? []) {
            if (!years.includes(year)) {
                years.push(year);
            }
        }
    }
    years.sort((a, b) => b - a);
    return {
        data: { groups, variants: visualVariants(variants), products: visualProducts(products), years },
        resource: 'products',
        initialGroup:
            groups.find((group: Group) => products.some((product) => product.group === group.group))?.group ??
            initialGroup,
    };
}

export function getVisualHistory(group: string, name: string, year: number): ProductHistory {
    if (group !== 'Uogienės' || name !== 'Avietės' || year !== currentYear) {
        return { updates: [], undates: [] };
    }
    const products = createScenarioData('history').products;
    const update = products.find((product) => product.name === name)?.updates?.[0];
    if (!update || !('time' in update)) {
        return { updates: [], undates: [] };
    }
    return {
        updates: [
            {
                group,
                name,
                user: undefined,
                comment: update.comment,
                amounts: update.years[0]?.amounts ?? [],
                time: update.time,
                sessionId: `:${update.time}`,
                year,
            },
        ],
        undates: [],
    };
}
