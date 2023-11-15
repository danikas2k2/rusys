import { compareNames } from '~/client/utils/compareNames';
import { filterNamedEntries } from '~/client/utils/filterNamedEntries';
import { matchParts } from '~/client/utils/matchParts';

jest.mock('~/client/utils/compareNames');
jest.mock('~/client/utils/matchParts');

describe('filterNamedEntries', () => {
    beforeEach(() => {
        (matchParts as jest.Mock).mockReturnValue(true);
        (compareNames as jest.Mock).mockReturnValue(0);
    });

    it('returns filtered and sorted entries when matches are found', () => {
        const result = filterNamedEntries({ Hello: 1, World: 2 }, 'Hello');
        expect(result).toEqual([
            ['Hello', 1],
            ['World', 2],
        ]);
    });

    it('returns empty array when no matches are found', () => {
        (matchParts as jest.Mock).mockReturnValue(false);
        const result = filterNamedEntries({ Hello: 1, World: 2 }, 'Test');
        expect(result).toEqual([]);
    });

    it('returns sorted entries when multiple matches are found', () => {
        (compareNames as jest.Mock).mockImplementation((a, b) => a.localeCompare(b));
        const result = filterNamedEntries({ World: 2, Hello: 1 }, 'Hello');
        expect(result).toEqual([
            ['Hello', 1],
            ['World', 2],
        ]);
    });
});
