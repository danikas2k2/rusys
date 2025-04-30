import { isDevMode } from '~/common/utils/env';

describe('isDevMode', () => {
    it('return false if NODE_ENV is not set', async () => {
        process.env.NODE_ENV = undefined;

        expect(isDevMode()).toBeFalse();
    });

    it('return false if NODE_ENV is "production"', async () => {
        process.env.NODE_ENV = 'production';

        expect(isDevMode()).toBeFalse();
    });

    it('return true if NODE_ENV is "development"', async () => {
        process.env.NODE_ENV = 'development';

        expect(isDevMode()).toBeTrue();
    });
});
