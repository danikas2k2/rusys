import moment from 'moment/moment';

import { getYears } from '~/server/data/years';

describe('getYears', () => {
    beforeEach(() => vi.useFakeTimers());

    afterAll(() => vi.useRealTimers());

    it('get list of years after switch month', () => {
        vi.setSystemTime(moment('2025-05-05T12:11:10.123Z').valueOf());

        expect(getYears()).toStrictEqual([25, 24, 23, 22, 21]);
    });

    it('get list of years before switch month', () => {
        vi.setSystemTime(moment('2025-01-01T12:11:10.123Z').valueOf());

        expect(getYears()).toStrictEqual([24, 23, 22, 21, 20]);
    });
});
