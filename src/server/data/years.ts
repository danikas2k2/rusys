import moment from 'moment';
import { type Year } from '~/store/types';

const MAX_YEARS = 5;
const SWITCH_MONTH = 4;

export function getYears(): Year[] {
    return [...Array(MAX_YEARS).keys()].map(
        (y) => +moment().subtract(y, 'years').subtract(SWITCH_MONTH, 'months').format('YY')
    );
}
