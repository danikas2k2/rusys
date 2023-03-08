import { getErrorMessage } from '~/utils/errors';

describe('getErrorMessage', () => {
    it('returns error message from error object', () => {
        expect(getErrorMessage(new Error('Error message'))).toEqual('Error message');
    });

    it('returns error message from string', () => {
        expect(getErrorMessage('Error message')).toEqual('Error message');
    });

    it('returns error message from undefined', () => {
        expect(getErrorMessage(undefined)).toEqual('Unknown error occurred');
    });

    it('returns error message from unsupported object', () => {
        expect(getErrorMessage({})).toEqual('Unknown error occurred');
    });
});
