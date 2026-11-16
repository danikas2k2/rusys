import { getConsumptionYear } from './consumptionYear';

describe('getConsumptionYear', () => {
    it('keeps an explicitly selected year', () => {
        expect(getConsumptionYear(18, new Date(2026, 6, 1))).toBe(18);
    });

    it('uses the September boundary for stock without a year', () => {
        expect(getConsumptionYear(0, new Date(2026, 7, 31))).toBe(25);
        expect(getConsumptionYear(0, new Date(2026, 8, 1))).toBe(26);
    });
});
