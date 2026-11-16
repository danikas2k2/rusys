// Non-annual stock uses year 0; consumption still belongs to the September period.
export function getConsumptionYear(year: number, now = new Date()): number {
    return year || (now.getFullYear() - (now.getMonth() < 8 ? 1 : 0)) % 100;
}
