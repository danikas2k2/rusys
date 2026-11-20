import { getCurrentConsumptionYear } from './consumptionYear';

describe('getCurrentConsumptionYear', () => {
    it('starts the new consumption year on September 1', () => {
        expect(getCurrentConsumptionYear(new Date(2026, 7, 31))).toBe(25);
        expect(getCurrentConsumptionYear(new Date(2026, 8, 1))).toBe(26);
    });
});
