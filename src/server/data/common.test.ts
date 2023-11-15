import { move, remove, removeGroup, rename, renameGroup } from '~/server/data/common';
import {
    moveDetails,
    removeDetails,
    removeDetailsGroup,
    renameDetails,
    renameDetailsGroup,
} from '~/server/data/details';
import {
    moveMissing,
    removeMissing,
    removeMissingGroup,
    renameMissing,
    renameMissingGroup,
} from '~/server/data/missing';
import {
    moveRemoving,
    removeRemoving,
    removeRemovingGroup,
    renameRemoving,
    renameRemovingGroup,
} from '~/server/data/removing';
import {
    moveUpdates,
    removeUpdates,
    removeUpdatesGroup,
    renameUpdates,
    renameUpdatesGroup,
} from '~/server/data/updates';

jest.mock('~/server/data/details', () => ({
    renameDetails: jest.fn(),
    renameDetailsGroup: jest.fn(),
    removeDetails: jest.fn(),
    removeDetailsGroup: jest.fn(),
    moveDetails: jest.fn(),
}));
jest.mock('~/server/data/missing', () => ({
    renameMissing: jest.fn(),
    renameMissingGroup: jest.fn(),
    removeMissing: jest.fn(),
    removeMissingGroup: jest.fn(),
    moveMissing: jest.fn(),
}));
jest.mock('~/server/data/removing', () => ({
    renameRemoving: jest.fn(),
    renameRemovingGroup: jest.fn(),
    removeRemoving: jest.fn(),
    removeRemovingGroup: jest.fn(),
    moveRemoving: jest.fn(),
}));
jest.mock('~/server/data/updates', () => ({
    renameUpdates: jest.fn(),
    renameUpdatesGroup: jest.fn(),
    removeUpdates: jest.fn(),
    removeUpdatesGroup: jest.fn(),
    moveUpdates: jest.fn(),
}));

describe('common', () => {
    afterEach(jest.clearAllMocks);

    describe('rename', () => {
        it('returns false if renameDetails returns false', async () => {
            (renameDetails as jest.Mock).mockResolvedValueOnce(false);
            expect(await rename('G', 'A', 'B')).toBeFalse();
            expect(renameDetails).toHaveBeenCalledWith('G', 'A', 'B');
            expect(renameMissing).not.toHaveBeenCalled();
            expect(renameRemoving).not.toHaveBeenCalled();
            expect(renameUpdates).not.toHaveBeenCalled();
        });

        it('returns true if renameDetails returns true', async () => {
            (renameDetails as jest.Mock).mockResolvedValueOnce(true);
            expect(await rename('G', 'A', 'B')).toBeTrue();
            expect(renameDetails).toHaveBeenCalledWith('G', 'A', 'B');
            expect(renameMissing).toHaveBeenCalledWith('G', 'A', 'B');
            expect(renameRemoving).toHaveBeenCalledWith('G', 'A', 'B');
            expect(renameUpdates).toHaveBeenCalledWith('G', 'A', 'B');
        });

        it('does nothing if names are the same', async () => {
            expect(await rename('G', 'A', 'A')).toBeFalse();
            expect(renameDetails).not.toHaveBeenCalled();
            expect(renameMissing).not.toHaveBeenCalled();
            expect(renameRemoving).not.toHaveBeenCalled();
            expect(renameUpdates).not.toHaveBeenCalled();
        });
    });

    describe('renameGroup', () => {
        it('returns false if renameDetailsGroup returns false', async () => {
            (renameDetailsGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await renameGroup('G', 'H')).toBeFalse();
            expect(renameDetailsGroup).toHaveBeenCalledWith('G', 'H');
            expect(renameMissingGroup).not.toHaveBeenCalled();
            expect(renameRemovingGroup).not.toHaveBeenCalled();
            expect(renameUpdatesGroup).not.toHaveBeenCalled();
        });

        it('returns true if renameDetailsGroup returns true', async () => {
            (renameDetailsGroup as jest.Mock).mockResolvedValueOnce(true);
            expect(await renameGroup('G', 'H')).toBeTrue();
            expect(renameDetailsGroup).toHaveBeenCalledWith('G', 'H');
            expect(renameMissingGroup).toHaveBeenCalledWith('G', 'H');
            expect(renameRemovingGroup).toHaveBeenCalledWith('G', 'H');
            expect(renameUpdatesGroup).toHaveBeenCalledWith('G', 'H');
        });

        it('does nothing if groups are the same', async () => {
            expect(await renameGroup('G', 'G')).toBeFalse();
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            expect(renameMissingGroup).not.toHaveBeenCalled();
            expect(renameRemovingGroup).not.toHaveBeenCalled();
            expect(renameUpdatesGroup).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('returns false if removeDetails returns false', async () => {
            (removeDetails as jest.Mock).mockResolvedValueOnce(false);
            expect(await remove('G', 'A')).toBeFalse();
            expect(removeDetails).toHaveBeenCalledWith('G', 'A');
            expect(removeMissing).not.toHaveBeenCalled();
            expect(removeRemoving).not.toHaveBeenCalled();
            expect(removeUpdates).not.toHaveBeenCalled();
        });

        it('returns true if removeDetails returns true', async () => {
            (removeDetails as jest.Mock).mockResolvedValueOnce(true);
            expect(await remove('G', 'A')).toBeTrue();
            expect(removeDetails).toHaveBeenCalledWith('G', 'A');
            expect(removeMissing).toHaveBeenCalledWith('G', 'A');
            expect(removeRemoving).toHaveBeenCalledWith('G', 'A');
            expect(removeUpdates).toHaveBeenCalledWith('G', 'A');
        });
    });

    describe('removeGroup', () => {
        it('returns false if removeDetailsGroup returns false', async () => {
            (removeDetailsGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await removeGroup('G')).toBeFalse();
            expect(removeDetailsGroup).toHaveBeenCalledWith('G');
            expect(removeMissingGroup).not.toHaveBeenCalled();
            expect(removeRemovingGroup).not.toHaveBeenCalled();
            expect(removeUpdatesGroup).not.toHaveBeenCalled();
        });

        it('returns true if removeDetailsGroup returns true', async () => {
            (removeDetailsGroup as jest.Mock).mockResolvedValueOnce(true);
            expect(await removeGroup('G')).toBeTrue();
            expect(removeDetailsGroup).toHaveBeenCalledWith('G');
            expect(removeMissingGroup).toHaveBeenCalledWith('G');
            expect(removeRemovingGroup).toHaveBeenCalledWith('G');
            expect(removeUpdatesGroup).toHaveBeenCalledWith('G');
        });
    });

    describe('move', () => {
        it('returns false if moveDetails returns false', async () => {
            (moveDetails as jest.Mock).mockResolvedValueOnce(false);
            expect(await move('G', 'A', 'H')).toBeFalse();
            expect(moveDetails).toHaveBeenCalledWith('G', 'A', 'H');
            expect(moveMissing).not.toHaveBeenCalled();
            expect(moveRemoving).not.toHaveBeenCalled();
            expect(moveUpdates).not.toHaveBeenCalled();
        });

        it('returns true if moveDetails returns true', async () => {
            (moveDetails as jest.Mock).mockResolvedValueOnce(true);
            expect(await move('G', 'A', 'H')).toBeTrue();
            expect(moveDetails).toHaveBeenCalledWith('G', 'A', 'H');
            expect(moveMissing).toHaveBeenCalledWith('G', 'A', 'H');
            expect(moveRemoving).toHaveBeenCalledWith('G', 'A', 'H');
            expect(moveUpdates).toHaveBeenCalledWith('G', 'A', 'H');
        });

        it('does nothing if groups are the same', async () => {
            expect(await move('G', 'A', 'G')).toBeFalse();
            expect(moveDetails).not.toHaveBeenCalled();
            expect(moveMissing).not.toHaveBeenCalled();
            expect(moveRemoving).not.toHaveBeenCalled();
            expect(moveUpdates).not.toHaveBeenCalled();
        });
    });
});
