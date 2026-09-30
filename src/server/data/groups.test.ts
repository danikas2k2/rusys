/** @vitest-environment node */
import { getGroupsFixture } from '@tests/fixtures';

import { deleteGroup, getGroups, renameGroup, reorderGroups, updateGroup } from '~/server/data/groups';
import { classifyImage, deleteImages, saveImage } from '~/server/data/images';
import { db } from '~/server/db';

vi.mock(import('~/server/db'));
vi.mock(import('~/server/data/images'));

describe('groups', () => {
    const groups = getGroupsFixture().sort((a, b) => a.order - b.order);

    beforeEach(async () => {
        await (await db()).collection('groups').insertMany(getGroupsFixture());
        // Echoes the image with no photo by default - matches how a non-photo-sized upload
        // classifies; individual tests override this when photo classification itself matters.
        vi.mocked(classifyImage).mockImplementation(async (image: string) => ({ image }));
    });

    afterEach(async () => {
        await (await db()).collection('groups').deleteMany({});
        vi.clearAllMocks();
    });

    describe('getGroups', () => {
        it('returns groups sorted by order and name', async () => {
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('returns stored image fields without classifying on read', async () => {
            await (
                await db()
            )
                .collection('groups')
                .updateOne({ group: 'Daržovės' }, { $set: { image: '/images/icon.png', photo: '/images/photo.png' } });

            await expect(getGroups()).resolves.toContainEqual({
                ...groups[1],
                image: '/images/icon.png',
                photo: '/images/photo.png',
            });
            expect(classifyImage).not.toHaveBeenCalled();
        });
    });

    describe('updateGroup', () => {
        it('updates a group with annual field = false', async () => {
            await expect(updateGroup('Daržovės', false)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: false, review: false },
            ]);
        });

        it('updates a group with annual field = true', async () => {
            await expect(updateGroup('Daržovės', true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: true, review: false },
            ]);
        });

        it('updates a group without annual field', async () => {
            await expect(updateGroup('Daržovės')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: true, review: false },
            ]);
        });

        it('updates a group with review = true', async () => {
            await expect(updateGroup('Daržovės', true, true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([groups[0], { ...groups[1], annual: true, review: true }]);
        });

        it('adds a new group to empty collection without order field', async () => {
            await (await db()).collection('groups').deleteMany({});

            await expect(updateGroup('Šaldyti')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Šaldyti', order: 0, annual: true, review: false },
            ]);
        });

        it('adds a group', async () => {
            await expect(updateGroup('Šaldyti')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                ...groups,
                { group: 'Šaldyti', order: 3, annual: true, review: false },
            ]);
        });

        it('adds a group with annual = true', async () => {
            await expect(updateGroup('Grybai', true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                ...groups,
                { group: 'Grybai', order: 3, annual: true, review: false },
            ]);
        });

        it('adds a group with annual = false', async () => {
            await expect(updateGroup('Kruopos', false)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                ...groups,
                { group: 'Kruopos', order: 3, annual: false, review: false },
            ]);
        });

        it('adds a group with review = true', async () => {
            await expect(updateGroup('Grybai', true, true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                ...groups,
                { group: 'Grybai', order: 3, annual: true, review: true },
            ]);
        });

        it('does nothing if group is not updated', async () => {
            await updateGroup('Uogienės', true, false);

            await expect(updateGroup('Uogienės', true, false)).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual([{ ...groups[0], review: false }, groups[1]]);
        });

        it('does nothing for empty group', async () => {
            await expect(updateGroup('', true)).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        describe('image handling', () => {
            it('uploads a new image, classifies it, and stores it', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

                await expect(updateGroup('Daržovės', true, false, 'data:image/png;base64,AAA')).resolves.toBe(true);

                expect(saveImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
                expect(classifyImage).toHaveBeenCalledWith('/images/ab/cd/new-image.png');
                expect(deleteImages).toHaveBeenCalledWith(undefined, undefined);
                await expect(getGroups()).resolves.toStrictEqual([
                    groups[0],
                    { ...groups[1], annual: true, review: false, image: '/images/ab/cd/new-image.png' },
                ]);
            });

            it('classifies a photo-sized upload, storing both the thumbnail and the photo', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/saved.png');
                vi.mocked(classifyImage).mockResolvedValueOnce({
                    image: '/images/ab/cd/thumb.png',
                    photo: '/images/ab/cd/saved.png',
                });

                await expect(updateGroup('Daržovės', true, false, 'data:image/png;base64,AAA')).resolves.toBe(true);

                await expect(getGroups()).resolves.toStrictEqual([
                    groups[0],
                    {
                        ...groups[1],
                        annual: true,
                        review: false,
                        image: '/images/ab/cd/thumb.png',
                        photo: '/images/ab/cd/saved.png',
                    },
                ]);
            });

            it('deletes the previous image file(s) when replacing it', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
                await updateGroup('Daržovės', true, false, 'data:image/png;base64,AAA');
                vi.clearAllMocks();
                vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

                await updateGroup('Daržovės', true, false, 'data:image/png;base64,AAA');

                expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
            });

            it('deletes the image file when the image is removed', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
                await updateGroup('Daržovės', true, false, 'data:image/png;base64,AAA');
                vi.clearAllMocks();

                await updateGroup('Daržovės', true, false, '');

                expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
                await expect(getGroups()).resolves.toStrictEqual([
                    groups[0],
                    { ...groups[1], annual: true, review: false },
                ]);
            });

            it('does not touch image files when the image is unchanged', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/same/same.png');
                await updateGroup('Daržovės', true, false, 'data:image/png;base64,AAA');
                vi.clearAllMocks();

                await updateGroup('Daržovės', true, false, '/images/same/same.png');

                expect(saveImage).not.toHaveBeenCalled();
                expect(deleteImages).not.toHaveBeenCalled();
            });

            it('does not touch image files when image is not provided', async () => {
                await updateGroup('Daržovės', true, false);

                expect(saveImage).not.toHaveBeenCalled();
                expect(deleteImages).not.toHaveBeenCalled();
            });
        });
    });

    describe('updateGroupOrders', () => {
        it('updates group orders', async () => {
            await expect(reorderGroups({ Daržovės: 1, Uogienės: 3 })).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Daržovės', order: 1 },
                { group: 'Uogienės', order: 3, annual: true },
            ]);
        });

        it('updates single group order', async () => {
            await expect(reorderGroups({ Uogienės: 3 })).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Daržovės', order: 2 },
                { group: 'Uogienės', order: 3, annual: true },
            ]);
        });

        it('does nothing for undefined data', async () => {
            await expect(reorderGroups()).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty object', async () => {
            await expect(reorderGroups({})).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if no groups are updated', async () => {
            await expect(reorderGroups({ G: 2, J: 1 })).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('renameGroup', () => {
        it('renames a group', async () => {
            await expect(renameGroup('Uogienės', 'Grybai')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Grybai', order: 1, annual: true, review: false },
                groups[1],
            ]);
        });

        it('renames a group with review = true', async () => {
            await expect(renameGroup('Uogienės', 'Grybai', true, true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Grybai', order: 1, annual: true, review: true },
                groups[1],
            ]);
        });

        it('does nothing if new name is the same as old name', async () => {
            await expect(renameGroup('Daržovės', 'Daržovės')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if new name already exists', async () => {
            await expect(renameGroup('Daržovės', 'Uogienės')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            await expect(renameGroup('Šaldyti', 'Daržovės')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty group', async () => {
            await expect(renameGroup('', 'Daržovės')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for new empty group', async () => {
            await expect(renameGroup('Daržovės', '')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        describe('image handling', () => {
            it('uploads a new image and stores it', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

                await expect(renameGroup('Uogienės', 'Grybai', true, false, 'data:image/png;base64,AAA')).resolves.toBe(
                    true
                );

                expect(saveImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
                await expect(getGroups()).resolves.toStrictEqual([
                    {
                        group: 'Grybai',
                        order: 1,
                        annual: true,
                        review: false,
                        image: '/images/ab/cd/new-image.png',
                    },
                    groups[1],
                ]);
            });

            it('deletes the previous image file when the image is removed', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
                await updateGroup('Uogienės', true, false, 'data:image/png;base64,AAA');
                vi.clearAllMocks();

                await renameGroup('Uogienės', 'Grybai', true, false, '');

                expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
            });

            it('does not touch image files when image is not provided', async () => {
                await renameGroup('Uogienės', 'Grybai');

                expect(saveImage).not.toHaveBeenCalled();
                expect(deleteImages).not.toHaveBeenCalled();
            });
        });
    });

    describe('deleteGroup', () => {
        it('deletes a group', async () => {
            await expect(deleteGroup('Uogienės')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual(groups.slice(1));
        });

        it('does nothing with empty group', async () => {
            await expect(deleteGroup('')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            await expect(deleteGroup('Šaldyti')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('keeps the image file for the archived group', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await updateGroup('Uogienės', true, false, 'data:image/png;base64,AAA');
            vi.clearAllMocks();

            await expect(deleteGroup('Uogienės')).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('does not touch image files when the group has no image', async () => {
            await expect(deleteGroup('Uogienės')).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });
    });
});
