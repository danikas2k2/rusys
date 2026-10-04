import type { Group } from '~/common/data';
import type { InitialAppData, InitialResource } from '~/components/app/initialData';
import { Links } from '~/lib/links';
import { getGroups } from '~/server/data/groups';
import { getProductsWithYears } from '~/server/data/products';
import { getFullSummary } from '~/server/data/summary';
import { getVariants } from '~/server/data/variants';

export async function getInitialAppData(pathname: string): Promise<{
    data: InitialAppData;
    resource: InitialResource;
    initialGroup?: string;
}> {
    if (process.env.PLAYWRIGHT_TEST === '1') {
        const { getVisualAppData, getVisualScenario } = await import('~/tests/fixtures/visualData');
        const visualScenario = await getVisualScenario();
        if (visualScenario) {
            return getVisualAppData(pathname, visualScenario);
        }
    }
    if (pathname === Links.CATEGORIES) {
        const groups = await getGroups();
        return { data: { groups }, resource: 'groups', initialGroup: groups[0]?.group };
    }
    if (pathname === Links.VARIANTS) {
        const [groups, variants] = await Promise.all([getGroups(), getVariants()]);
        return {
            data: { groups, variants },
            resource: 'variants',
            initialGroup: firstGroupWithContent(groups, variants),
        };
    }
    if (pathname === Links.SUMMARY) {
        const data = await getFullSummary();
        return { data, resource: 'summary', initialGroup: firstGroupWithContent(data.groups, data.summary) };
    }
    const [productsWithYears, groups, variants] = await Promise.all([
        getProductsWithYears(),
        getGroups(),
        getVariants(),
    ]);
    return {
        data: { ...productsWithYears, groups, variants },
        resource: 'products',
        initialGroup: firstGroupWithContent(groups, productsWithYears.products),
    };
}

function firstGroupWithContent(groups: readonly Group[], items: readonly { group: string }[]): string | undefined {
    const nonEmptyGroups = new Set(items.map(({ group }) => group));
    return groups.find(({ group }) => nonEmptyGroups.has(group))?.group ?? groups[0]?.group;
}
