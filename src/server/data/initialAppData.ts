import type { InitialAppData, InitialResource } from '~/components/app/initialData';
import { Links } from '~/lib/links';
import type { Group } from '~/schema';
import { getGroups } from '~/server/data/groups';
import { getProductsWithYears } from '~/server/data/products';
import { getFullSummary } from '~/server/data/summary';
import { getVariants } from '~/server/data/variants';
import { withinTransaction } from '~/server/db';

export async function getInitialAppData(pathname: string): Promise<{
    data: InitialAppData;
    resource: InitialResource;
    initialGroup?: string;
}> {
    return withinTransaction(async (session) => {
        if (pathname === Links.CATEGORIES) {
            const groups = await getGroups(session);
            return { data: { groups }, resource: 'groups', initialGroup: groups[0]?.group };
        }
        if (pathname === Links.VARIANTS) {
            const groups = await getGroups(session);
            const variants = await getVariants(session);
            return {
                data: { groups, variants },
                resource: 'variants',
                initialGroup: firstGroupWithContent(groups, variants),
            };
        }
        if (pathname === Links.SUMMARY) {
            const data = await getFullSummary(session);
            return { data, resource: 'summary', initialGroup: firstGroupWithContent(data.groups, data.summary) };
        }
        const productsWithYears = await getProductsWithYears(session);
        const groups = await getGroups(session);
        const variants = await getVariants(session);
        return {
            data: { ...productsWithYears, groups, variants },
            resource: 'products',
            initialGroup: firstGroupWithContent(groups, productsWithYears.products),
        };
    });
}

function firstGroupWithContent(groups: readonly Group[], items: readonly { group: string }[]): string | undefined {
    const nonEmptyGroups = new Set(items.map(({ group }) => group));
    return groups.find(({ group }) => nonEmptyGroups.has(group))?.group ?? groups[0]?.group;
}
