import { getYears } from '~/server/data/years';

describe('getYears', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-05-01'));
    });

    afterAll(() => jest.useRealTimers());

    it('get list of years after switch month', () => {
        expect(getYears()).toEqual([23, 22, 21, 20, 19]);
    });

    it('get list of years before switch month', () => {
        jest.setSystemTime(new Date('2023-01-01'));
        expect(getYears()).toEqual([22, 21, 20, 19, 18]);
    });
});
