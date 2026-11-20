export const CONSUMPTION_START_MONTH = 9;
export const RECENT_CONSUMPTION_YEARS = 3;

export function getCurrentConsumptionYear(now = new Date()): number {
    return (now.getFullYear() - (now.getMonth() < CONSUMPTION_START_MONTH - 1 ? 1 : 0)) % 100;
}
