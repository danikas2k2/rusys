import { translate } from '~/lib/translate';
import { getErrorMessage } from '~/lib/utils/errors';
import { SchemaError, ZodError } from '~/schema';

describe('getErrorMessage', () => {
    it('does not expose unrecognized Zod issue details', () => {
        const cause = new ZodError([{ code: 'custom', path: ['token'], message: 'Sensitive validation details' }]);

        expect(getErrorMessage(cause)).toBe(SchemaError.InvalidRequest);
    });

    it('starts every user-facing error message with an uppercase letter', () => {
        for (const message of Object.values(SchemaError)) {
            expect(message[0]).toBe(message[0].toUpperCase());
        }
    });

    it('preserves known user-facing messages from server errors', () => {
        expect(getErrorMessage(new Error(SchemaError.RequestFailed))).toBe(SchemaError.RequestFailed);
    });

    it('preserves known user-facing messages from strings', () => {
        expect(getErrorMessage(SchemaError.InvalidRequest)).toBe(SchemaError.InvalidRequest);
    });

    it('does not expose arbitrary backend messages', () => {
        expect(getErrorMessage(new Error('Mongo connection string was leaked'))).toBe(SchemaError.Unknown);

        expect(getErrorMessage('database unavailable')).toBe(SchemaError.Unknown);
    });

    it('translates known error codes only at presentation time', () => {
        expect(translate(getErrorMessage(new Error(SchemaError.RequestFailed)), 'lt-LT')).toBe(
            translate(SchemaError.RequestFailed, 'lt-LT')
        );

        expect(translate(getErrorMessage(new Error('database unavailable')), 'lt-LT')).toBe(
            translate(SchemaError.Unknown, 'lt-LT')
        );
    });

    it('has Lithuanian translations for every user-facing error', () => {
        for (const message of Object.values(SchemaError)) {
            expect(translate(message, 'lt-LT')).not.toBe(message);
        }
    });

    it('returns error message from undefined', () => {
        expect(getErrorMessage(undefined)).toBe(SchemaError.Unknown);
    });

    it('returns error message from unsupported object', () => {
        expect(getErrorMessage({})).toBe(SchemaError.Unknown);
    });
});
