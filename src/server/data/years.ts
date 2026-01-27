const MAX_YEARS = 5;
const SWITCH_MONTH = 4; // April

export function getYears(max = MAX_YEARS): number[] {
    return [...Array(max).keys()].map((y) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - y);
        d.setMonth(d.getMonth() - SWITCH_MONTH);
        return d.getFullYear() % 100;
    });
}
