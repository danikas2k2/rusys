import moment from 'moment';

const MAX_YEARS = 5;
const SWITCH_MONTH = 4; // April

export function getYears(max = MAX_YEARS): number[] {
    return [...Array(max).keys()].map(
        (y) => +moment().subtract(y, 'years').subtract(SWITCH_MONTH, 'months').format('YY')
    );
}
