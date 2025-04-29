import moment from 'moment';

const MAX_YEARS = 5;
const SWITCH_MONTH = 4;

export function getYears(): number[] {
    return [...Array(MAX_YEARS).keys()].map(
        (y) => +moment().subtract(y, 'years').subtract(SWITCH_MONTH, 'months').format('YY')
    );
}
