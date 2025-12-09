import { getId, ID_SEPARATOR, parseId } from '~/client/utils/id';

describe('getId', () => {
    it('joins string parts with separator', () => {
        expect(getId('group', 'name')).toBe('group:name');
    });

    it('joins multiple parts with separator', () => {
        expect(getId('group', 'name', 'variant')).toBe('group:name:variant');
    });

    it('joins number parts with separator', () => {
        expect(getId(1, 2, 3)).toBe('1:2:3');
    });

    it('joins boolean parts with separator', () => {
        expect(getId(true, false)).toBe('true:false');
    });

    it('joins mixed type parts with separator', () => {
        expect(getId('group', 123, true)).toBe('group:123:true');
    });

    it('returns empty string when no parts provided', () => {
        expect(getId()).toBe('');
    });

    it('returns single part without separator', () => {
        expect(getId('single')).toBe('single');
    });

    it('handles empty strings', () => {
        expect(getId('', 'name')).toBe(':name');
        expect(getId('group', '')).toBe('group:');
    });
});

describe('parseId', () => {
    it('splits string id into parts', () => {
        expect(parseId('group:name')).toStrictEqual(['group', 'name']);
    });

    it('splits id with multiple parts', () => {
        expect(parseId('group:name:variant')).toStrictEqual(['group', 'name', 'variant']);
    });

    it('splits number id into parts', () => {
        expect(parseId('1:2:3')).toStrictEqual(['1', '2', '3']);
    });

    it('splits id with limit', () => {
        expect(parseId('group:name:variant', 2)).toStrictEqual(['group', 'name']);
    });

    it('splits id with limit of 1', () => {
        expect(parseId('group:name:variant', 1)).toStrictEqual(['group']);
    });

    it('returns single element array for id without separator', () => {
        expect(parseId('single')).toStrictEqual(['single']);
    });

    it('handles empty string', () => {
        expect(parseId('')).toStrictEqual(['']);
    });

    it('handles number id parameter', () => {
        expect(parseId(123)).toStrictEqual(['123']);
    });

    it('handles id with trailing separator', () => {
        expect(parseId('group:name:')).toStrictEqual(['group', 'name', '']);
    });

    it('handles id with leading separator', () => {
        expect(parseId(':group:name')).toStrictEqual(['', 'group', 'name']);
    });
});

describe('id separator', () => {
    it('is colon character', () => {
        expect(ID_SEPARATOR).toBe(':');
    });
});
