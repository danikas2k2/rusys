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

export async function getDetailsWithYears(): Promise<ApiDetailsWithYears> {
    const years = getYears();
    return { years, details: await getDetails(years) };
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
