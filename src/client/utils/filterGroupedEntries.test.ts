import { compareGroups } from '~/client/utils/compareGroups';
import { filterGroupedEntries } from '~/client/utils/filterGroupedEntries';
import { filterNamedEntries } from '~/client/utils/filterNamedEntries';

jest.mock('~/client/utils/compareGroups');
jest.mock('~/client/utils/filterNamedEntries');

describe('filterGroupedEntries', () => {
    beforeEach(() => {
        (filterNamedEntries as jest.Mock).mockReturnValue([['Hello', 1]]);
        (compareGroups as jest.Mock).mockReturnValue(0);
    });

    it('returns filtered and sorted entries when matches are found', () => {
        const result = filterGroupedEntries({ Hello: { Hello: 1 } }, 'Hello');
        expect(result).toEqual([['Hello', [['Hello', 1]]]]);
    });

    it('returns empty array when no matches are found', () => {
        (filterNamedEntries as jest.Mock).mockReturnValue([]);
        const result = filterGroupedEntries({ Hello: { Hello: 1 } }, 'Test');
        expect(result).toEqual([]);
    });

    it('returns sorted entries when multiple matches are found', () => {
        (compareGroups as jest.Mock).mockImplementation((a, b) => a.localeCompare(b));
        const result = filterGroupedEntries({ World: { Hello: 1 }, Hello: { Hello: 1 } }, 'Hello');
        expect(result).toEqual([
            ['Hello', [['Hello', 1]]],
            ['World', [['Hello', 1]]],
        ]);
    });
});
