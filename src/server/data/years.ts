const MAX_YEARS = 5;
const SWITCH_MONTH = 4; // May (zero-based): start offering the next harvest year after April

export function getYears(max = MAX_YEARS, switchMonth = SWITCH_MONTH): number[] {
    const now = new Date();
    const currentYear = now.getFullYear() - (now.getMonth() < switchMonth ? 1 : 0);
    return [...Array(max).keys()].map((offset) => (currentYear - offset) % 100);
}
