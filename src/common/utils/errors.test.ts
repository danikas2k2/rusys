import { getErrorMessage } from '~/common/utils/errors';

describe('getErrorMessage', () => {
    it('returns error message from error object', () => {
        expect(getErrorMessage(new Error('Error message'))).toBe('Error message');
    });

    it('returns error message from string', () => {
        expect(getErrorMessage('Error message')).toBe('Error message');
    });

    it('returns error message from undefined', () => {
        expect(getErrorMessage(undefined)).toBe('Unknown error occurred');
    });

    it('returns error message from unsupported object', () => {
        expect(getErrorMessage({})).toBe('Unknown error occurred');
    });
});
