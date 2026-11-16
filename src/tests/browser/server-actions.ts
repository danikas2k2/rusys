import type { InitialAppData } from '~/components/app/initialData';
import type { ProductIdentity, ProductYearIdentity } from '~/schema';
import { getVisualHistory } from '~/tests/fixtures/visualData';

let visualData: InitialAppData = {};
export function setVisualServerData(data: InitialAppData) {
    visualData = data;
}

const noop = async () => {};
const empty = async () => [];

export const getProductsAction = async () => ({ products: [], years: [], groups: [], variants: [] });
export const addProductAction = noop;
export const deleteProductAction = noop;
export const renameProductAction = noop;
export const moveProductAction = noop;
export const setProductParentAction = noop;
export const setProductExpiryToleranceAction = noop;
export const setProductMissingAction = noop;
export const applyReviewAction = noop;
export const setProductRemovingAction = noop;
export const setProductImageAction = noop;
export const setVariantImageAction = noop;
export const dropImageAction = noop;
export const setAmountsAction = noop;
export const setAmountsBatchAction = noop;
export const transferAmountsAction = noop;
export const moveConsumedToRecycledAction = noop;
export const undoProductAction = noop;
export const redoProductAction = noop;
export const getProductHistory = async ({ group, name, year }: ProductYearIdentity) =>
    getVisualHistory(group, name, year, new URLSearchParams(window.location.search).has('history-multiple'));
export const getVariantsAction = async () => ({ variants: [], groups: [] });
export const updateVariantAction = noop;
export const renameVariantAction = noop;
export const copyVariantAction = noop;
export const deleteVariantAction = noop;
export const reorderVariantsAction = noop;
export const getGroupsAction = empty;
export const updateGroupAction = noop;
export const renameGroupAction = noop;
export const deleteGroupAction = noop;
export const reorderGroupsAction = noop;
export const readSummary = async () => ({ summary: [], years: [], groups: [], variants: [] });
export const getSummaryHistory = getProductHistory;
export const importArchive = noop;
export const exportArchive = async () => '';
export const loginWithGoogle = noop;
export const logout = noop;

export const readProductSummary = async ({ group, name, year }: ProductYearIdentity) =>
    visualData.summary
        ?.find((item) => item.group === group && item.name === name)
        ?.years?.find((entry) => entry.year === year)?.amounts ?? [];

export const readProductConsumptionYears = async ({ group, name }: ProductIdentity) =>
    visualData.summary
        ?.find((item) => item.group === group && item.name === name)
        ?.years?.filter((entry) => entry.amounts?.some((amount) => amount.amount > 0))
        .map((entry) => entry.year) ?? [];
