import { deleteGroup, renameGroup, reorderGroups, updateGroup } from '~/schema/groups';

describe('group schemas', () => {
    it('normalizes identities and keeps partial updates partial', () => {
        expect(updateGroup.parse({ group: ' A ', review: false, image: '' })).toStrictEqual({
            group: 'A',
            review: false,
            image: '',
        });
        expect(renameGroup.parse({ group: ' A ', targetGroup: ' B ' })).toStrictEqual({ group: 'A', targetGroup: 'B' });
        expect(deleteGroup.parse({ group: ' A ' })).toStrictEqual({ group: 'A' });
    });

    it.each([
        { group: '' },
        { group: '   ' },
        { group: 'A:B' },
        { group: 1 },
        { group: 'A', annual: null },
        { group: 'A', review: 'true' },
        { group: 'A', image: 42 },
        { group: 'A', update: { annual: true } },
    ])('rejects malformed group changes %j', (request) => {
        expect(updateGroup.safeParse(request).success).toBe(false);
    });

    it('rejects empty or non-finite orders', () => {
        expect(reorderGroups.safeParse({ groups: {} }).success).toBe(false);
        expect(reorderGroups.safeParse({ groups: { A: Infinity } }).success).toBe(false);
    });

    it('rejects unknown reorder fields', () => {
        expect(reorderGroups.safeParse({ groups: { A: 0 }, user: 'client' }).success).toBe(false);
    });
});
