import { getYears } from '~/server/data/years';

describe('getYears', () => {
    beforeEach(() => vi.useFakeTimers());

    afterAll(() => vi.useRealTimers());

    it('uses the new product year from May 1 by default', () => {
        vi.setSystemTime(Date.parse('2026-05-01T12:11:10.123Z'));

        expect(getYears()).toStrictEqual([26, 25, 24, 23, 22]);
    });

    it('keeps the previous product year through April 30 by default', () => {
        vi.setSystemTime(Date.parse('2026-04-30T12:11:10.123Z'));

        expect(getYears()).toStrictEqual([25, 24, 23, 22, 21]);
    });

    it('uses an explicitly provided switch month for accounting years', () => {
        vi.setSystemTime(Date.parse('2026-08-31T12:11:10.123Z'));

        expect(getYears(3, 8)).toStrictEqual([25, 24, 23]);

        vi.setSystemTime(Date.parse('2026-09-01T12:11:10.123Z'));

        expect(getYears(3, 8)).toStrictEqual([26, 25, 24]);
    });
});
