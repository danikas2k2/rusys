import { isDevMode } from '~/common/utils/dev';

describe('isDevMode', () => {
    it('return true if NODE_ENV is not set', async () => {
        process.env.NODE_ENV = undefined;

        expect(isDevMode()).toBe(true);
    });

    it('return false if NODE_ENV is "production"', async () => {
        process.env.NODE_ENV = 'production';

        expect(isDevMode()).toBe(false);
    });

    it('return true if NODE_ENV is "development"', async () => {
        process.env.NODE_ENV = 'development';

        expect(isDevMode()).toBe(true);
    });

    it('return true if NODE_ENV is "test"', async () => {
        process.env.NODE_ENV = 'test';

        expect(isDevMode()).toBe(true);
    });
});
