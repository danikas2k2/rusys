import { getYears } from '~/server/data/years';

describe('getYears', () => {
    beforeEach(() => vi.useFakeTimers());

    afterAll(() => vi.useRealTimers());

    it('uses the new accounting year from September 1', () => {
        vi.setSystemTime(Date.parse('2026-09-01T12:11:10.123Z'));

        expect(getYears()).toStrictEqual([26, 25, 24, 23, 22]);
    });

    it('keeps the previous accounting year through August 31', () => {
        vi.setSystemTime(Date.parse('2026-08-31T12:11:10.123Z'));

        expect(getYears()).toStrictEqual([25, 24, 23, 22, 21]);
    });

    it('returns the requested number of accounting years', () => {
        vi.setSystemTime(Date.parse('2026-08-13T12:11:10.123Z'));

        expect(getYears(3)).toStrictEqual([25, 24, 23]);
    });
});
