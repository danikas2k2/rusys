import { getVisualHistory, getVisualScenario } from './visualData';

export async function getProductHistoryData(group: string, name: string, year: number) {
    await getVisualScenario();
    return getVisualHistory(group, name, year);
}

export async function getSummaryHistoryData(group: string, name: string, year: number) {
    await getVisualScenario();
    return getVisualHistory(group, name, year);
}
