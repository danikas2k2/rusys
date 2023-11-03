import { remove, rename } from '~/server/data/common';
import { removeDetails, renameDetails } from '~/server/data/details';
import { removeMissing, renameMissing } from '~/server/data/missing';
import { removeRemoving, renameRemoving } from '~/server/data/removing';
import { removeUpdates, renameUpdates } from '~/server/data/updates';

jest.mock('~/server/data/details', () => ({
    renameDetails: jest.fn(),
    removeDetails: jest.fn(),
}));
jest.mock('~/server/data/missing', () => ({
    renameMissing: jest.fn(),
    removeMissing: jest.fn(),
}));
jest.mock('~/server/data/removing', () => ({
    renameRemoving: jest.fn(),
    removeRemoving: jest.fn(),
}));
jest.mock('~/server/data/updates', () => ({
    renameUpdates: jest.fn(),
    removeUpdates: jest.fn(),
}));

describe('common', () => {
    afterEach(jest.clearAllMocks);

    describe('rename', () => {
        it('returns false if renameDetails returns false', async () => {
            (renameDetails as jest.Mock).mockResolvedValueOnce(false);
            expect(await rename('A', 'B')).toBeFalse();
            expect(renameDetails).toHaveBeenCalledWith('A', 'B');
            expect(renameMissing).toHaveBeenCalledWith('A', 'B');
            expect(renameRemoving).toHaveBeenCalledWith('A', 'B');
            expect(renameUpdates).toHaveBeenCalledWith('A', 'B');
        });

        it('returns true if renameDetails returns true', async () => {
            (renameDetails as jest.Mock).mockResolvedValueOnce(true);
            expect(await rename('A', 'B')).toBeTrue();
            expect(renameDetails).toHaveBeenCalledWith('A', 'B');
            expect(renameMissing).toHaveBeenCalledWith('A', 'B');
            expect(renameRemoving).toHaveBeenCalledWith('A', 'B');
            expect(renameUpdates).toHaveBeenCalledWith('A', 'B');
        });

        it('does nothing if names are the same', async () => {
            expect(await rename('A', 'A')).toBeFalse();
            expect(renameDetails).not.toHaveBeenCalled();
            expect(renameMissing).not.toHaveBeenCalled();
            expect(renameRemoving).not.toHaveBeenCalled();
            expect(renameUpdates).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('returns false if removeDetails returns false', async () => {
            (removeDetails as jest.Mock).mockResolvedValueOnce(false);
            expect(await remove('A')).toBeFalse();
            expect(removeDetails).toHaveBeenCalledWith('A');
            expect(removeMissing).toHaveBeenCalledWith('A');
            expect(removeRemoving).toHaveBeenCalledWith('A');
            expect(removeUpdates).toHaveBeenCalledWith('A');
        });

        it('returns true if removeDetails returns true', async () => {
            (removeDetails as jest.Mock).mockResolvedValueOnce(true);
            expect(await remove('A')).toBeTrue();
            expect(removeDetails).toHaveBeenCalledWith('A');
            expect(removeMissing).toHaveBeenCalledWith('A');
            expect(removeRemoving).toHaveBeenCalledWith('A');
            expect(removeUpdates).toHaveBeenCalledWith('A');
        });
    });
});
