import { getDetails } from '~/server/data/details';
import { getGroups } from '~/server/data/groups';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';
import type {
    ApiDetailsWithGroups,
    ApiDetailsWithVariants,
    ApiDetailsWithYears,
    ApiGroups,
    ApiVariants,
    ApiVariantsWithGroups,
} from '~/types/api';
import type { Details } from '~/types/data';

export async function getDetailsWithYears(): Promise<ApiDetailsWithYears> {
    const years = getYears();
    const details = await getDetails();
    return {
        details,
        years: details
            .reduce(
                (acc: number[], d: Details) => {
                    if (d.years) {
                        for (const dy of d.years) {
                            if (dy.year && !acc.includes(dy.year)) {
                                acc.push(dy.year);
                            }
                        }
                    }
                    return acc;
                },
                years.slice(0, 5)
            )
            .sort((a, b) => b - a),
    };
}

export const getGroupsResponse = async (): Promise<ApiGroups> => ({ groups: await getGroups() });

export const getVariantsResponse = async (): Promise<ApiVariants> => ({ variants: await getVariants() });

export const getDetailsWithVariants = async (): Promise<ApiDetailsWithVariants> => ({
    ...(await getDetailsWithYears()),
    ...(await getVariantsResponse()),
});

export const getDetailsWithGroups = async (): Promise<ApiDetailsWithGroups> => ({
    ...(await getDetailsWithVariants()),
    ...(await getGroupsResponse()),
});

export const getVariantsWithGroups = async (): Promise<ApiVariantsWithGroups> => ({
    ...(await getVariantsResponse()),
    ...(await getGroupsResponse()),
});
