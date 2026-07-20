import { getValidator } from '~/server/data/schema/getValidator';

vi.mock(import('~/server/data/schema/schema.json'), (): any => ({
    default: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
        },
        required: ['name', 'age', 'date'],
    },
}));

describe('getValidator', () => {
    it('returns a validate function', () => {
        const validator = getValidator();

        expect(validator).toBeInstanceOf(Function);
    });

    it('validates a valid schema', () => {
        const validator = getValidator();
        const validData = {
            name: 'test',
            age: 30,
            date: '2023-10-01T12:00:00Z',
        };

        expect(validator(validData)).toBe(true);
    });

    it('invalidates an invalid schema', () => {
        const validator = getValidator();
        const invalidData = {
            name: 'test',
            age: 'invalid_age',
            date: 'invalid_date',
        };

        expect(validator(invalidData)).toBe(false);
    });
});
