const MAX_YEARS = 5;
const ACCOUNTING_YEAR_START_MONTH = 8; // September (zero-based)

export function getYears(max = MAX_YEARS): number[] {
    const now = new Date();
    const currentAccountingYear = now.getFullYear() - (now.getMonth() < ACCOUNTING_YEAR_START_MONTH ? 1 : 0);
    return [...Array(max).keys()].map((offset) => (currentAccountingYear - offset) % 100);
}
