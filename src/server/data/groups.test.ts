/** @vitest-environment node */
import { getGroupsFixture } from '@tests/fixtures';

import { SchemaError } from '~/schema';
import {
    deleteGroup as deleteGroupData,
    getGroups as getGroupsData,
    renameGroup as renameGroupData,
    reorderGroups as reorderGroupsData,
    updateGroup as updateGroupData,
} from '~/server/data/groups';
import { classifyImage, deleteImages, saveImage } from '~/server/data/images';
import { db, withinTransaction } from '~/server/db';

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
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('returns stored image fields without classifying on read', async () => {
            await (
                await db()
            )
                .collection('groups')
                .updateOne({ group: 'Daržovės' }, { $set: { image: '/images/icon.png', photo: '/images/photo.png' } });

            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toContainEqual({
                ...groups[1],
                image: '/images/icon.png',
                photo: '/images/photo.png',
            });
            expect(classifyImage).not.toHaveBeenCalled();
        });
    });

    describe('updateGroup', () => {
        it('updates a group with annual field = false', async () => {
            await expect(
                withinTransaction((session) => updateGroupData({ group: 'Daržovės', annual: false }, session))
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: false, review: false },
            ]);
        });

        it('updates a group with annual field = true', async () => {
            await expect(
                withinTransaction((session) => updateGroupData({ group: 'Daržovės', annual: true }, session))
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: true, review: false },
            ]);
        });

        it('updates a group without annual field', async () => {
            await expect(withinTransaction((session) => updateGroupData({ group: 'Daržovės' }, session))).resolves.toBe(
                true
            );
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: true, review: false },
            ]);
        });

        it('updates a group with review = true', async () => {
            await expect(
                withinTransaction((session) =>
                    updateGroupData({ group: 'Daržovės', annual: true, review: true }, session)
                )
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: true, review: true },
            ]);
        });

        it('adds a new group to empty collection without order field', async () => {
            await (await db()).collection('groups').deleteMany({});

            await expect(withinTransaction((session) => updateGroupData({ group: 'Šaldyti' }, session))).resolves.toBe(
                true
            );
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                { group: 'Šaldyti', order: 0, annual: true, review: false },
            ]);
        });

        it('adds a group', async () => {
            await expect(withinTransaction((session) => updateGroupData({ group: 'Šaldyti' }, session))).resolves.toBe(
                true
            );
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                ...groups,
                { group: 'Šaldyti', order: 3, annual: true, review: false },
            ]);
        });

        it('adds a group with annual = true', async () => {
            await expect(
                withinTransaction((session) => updateGroupData({ group: 'Grybai', annual: true }, session))
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                ...groups,
                { group: 'Grybai', order: 3, annual: true, review: false },
            ]);
        });

        it('adds a group with annual = false', async () => {
            await expect(
                withinTransaction((session) => updateGroupData({ group: 'Kruopos', annual: false }, session))
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                ...groups,
                { group: 'Kruopos', order: 3, annual: false, review: false },
            ]);
        });

        it('adds a group with review = true', async () => {
            await expect(
                withinTransaction((session) =>
                    updateGroupData({ group: 'Grybai', annual: true, review: true }, session)
                )
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                ...groups,
                { group: 'Grybai', order: 3, annual: true, review: true },
            ]);
        });

        it('does nothing if group is not updated', async () => {
            await withinTransaction((session) =>
                updateGroupData({ group: 'Uogienės', annual: true, review: false }, session)
            );

            await expect(
                withinTransaction((session) =>
                    updateGroupData({ group: 'Uogienės', annual: true, review: false }, session)
                )
            ).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                { ...groups[0], review: false },
                groups[1],
            ]);
        });

        it('does nothing for empty group', async () => {
            await expect(
                withinTransaction((session) => updateGroupData({ group: '', annual: true }, session))
            ).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        describe('image handling', () => {
            it('uploads a new image, classifies it, and stores it', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

                await expect(
                    withinTransaction((session) =>
                        updateGroupData(
                            { group: 'Daržovės', annual: true, review: false, image: 'data:image/png;base64,AAA' },
                            session
                        )
                    )
                ).resolves.toBe(true);

                expect(saveImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
                expect(classifyImage).toHaveBeenCalledWith('/images/ab/cd/new-image.png');
                expect(deleteImages).toHaveBeenCalledWith(undefined, undefined);
                await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
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

                await expect(
                    withinTransaction((session) =>
                        updateGroupData(
                            { group: 'Daržovės', annual: true, review: false, image: 'data:image/png;base64,AAA' },
                            session
                        )
                    )
                ).resolves.toBe(true);

                await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
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
                await withinTransaction((session) =>
                    updateGroupData(
                        { group: 'Daržovės', annual: true, review: false, image: 'data:image/png;base64,AAA' },
                        session
                    )
                );
                vi.clearAllMocks();
                vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

                await withinTransaction((session) =>
                    updateGroupData(
                        { group: 'Daržovės', annual: true, review: false, image: 'data:image/png;base64,AAA' },
                        session
                    )
                );

                expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
            });

            it('deletes the image file when the image is removed', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
                await withinTransaction((session) =>
                    updateGroupData(
                        { group: 'Daržovės', annual: true, review: false, image: 'data:image/png;base64,AAA' },
                        session
                    )
                );
                vi.clearAllMocks();

                await withinTransaction((session) =>
                    updateGroupData({ group: 'Daržovės', annual: true, review: false, image: '' }, session)
                );

                expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
                await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                    groups[0],
                    { ...groups[1], annual: true, review: false },
                ]);
            });

            it('does not touch image files when the image is unchanged', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/same/same.png');
                await withinTransaction((session) =>
                    updateGroupData(
                        { group: 'Daržovės', annual: true, review: false, image: 'data:image/png;base64,AAA' },
                        session
                    )
                );
                vi.clearAllMocks();

                await withinTransaction((session) =>
                    updateGroupData(
                        { group: 'Daržovės', annual: true, review: false, image: '/images/same/same.png' },
                        session
                    )
                );

                expect(saveImage).not.toHaveBeenCalled();
                expect(deleteImages).not.toHaveBeenCalled();
            });

            it('does not touch image files when image is not provided', async () => {
                await withinTransaction((session) =>
                    updateGroupData({ group: 'Daržovės', annual: true, review: false }, session)
                );

                expect(saveImage).not.toHaveBeenCalled();
                expect(deleteImages).not.toHaveBeenCalled();
            });
        });
    });

    describe('updateGroupOrders', () => {
        it('updates group orders', async () => {
            await expect(
                withinTransaction((session) => reorderGroupsData({ Daržovės: 1, Uogienės: 3 }, session))
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                { group: 'Daržovės', order: 1 },
                { group: 'Uogienės', order: 3, annual: true },
            ]);
        });

        it('updates single group order', async () => {
            await expect(withinTransaction((session) => reorderGroupsData({ Uogienės: 3 }, session))).resolves.toBe(
                true
            );
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                { group: 'Daržovės', order: 2 },
                { group: 'Uogienės', order: 3, annual: true },
            ]);
        });

        it('does nothing for undefined data', async () => {
            await expect(withinTransaction((session) => reorderGroupsData(session))).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty object', async () => {
            await expect(withinTransaction((session) => reorderGroupsData({}, session))).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('does nothing if no groups are updated', async () => {
            await expect(withinTransaction((session) => reorderGroupsData({ G: 2, J: 1 }, session))).resolves.toBe(
                false
            );
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });
    });

    describe('renameGroup', () => {
        it('renames a group', async () => {
            await expect(
                withinTransaction((session) => renameGroupData({ group: 'Uogienės', targetGroup: 'Grybai' }, session))
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                { group: 'Grybai', order: 1, annual: true, review: false },
                groups[1],
            ]);
        });

        it('renames a group with review = true', async () => {
            await expect(
                withinTransaction((session) =>
                    renameGroupData({ group: 'Uogienės', targetGroup: 'Grybai', annual: true, review: true }, session)
                )
            ).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
                { group: 'Grybai', order: 1, annual: true, review: true },
                groups[1],
            ]);
        });

        it('does nothing if new name is the same as old name', async () => {
            await expect(
                withinTransaction((session) => renameGroupData({ group: 'Daržovės', targetGroup: 'Daržovės' }, session))
            ).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('rejects a new name that already exists', async () => {
            await expect(
                withinTransaction((session) => renameGroupData({ group: 'Daržovės', targetGroup: 'Uogienės' }, session))
            ).rejects.toThrow(SchemaError.CategoryAlreadyExists);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            await expect(
                withinTransaction((session) => renameGroupData({ group: 'Šaldyti', targetGroup: 'Daržovės' }, session))
            ).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty group', async () => {
            await expect(
                withinTransaction((session) => renameGroupData({ group: '', targetGroup: 'Daržovės' }, session))
            ).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('does nothing for new empty group', async () => {
            await expect(
                withinTransaction((session) => renameGroupData({ group: 'Daržovės', targetGroup: '' }, session))
            ).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        describe('image handling', () => {
            it('uploads a new image and stores it', async () => {
                vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

                await expect(
                    withinTransaction((session) =>
                        renameGroupData(
                            {
                                group: 'Uogienės',
                                targetGroup: 'Grybai',
                                annual: true,
                                review: false,
                                image: 'data:image/png;base64,AAA',
                            },
                            session
                        )
                    )
                ).resolves.toBe(true);

                expect(saveImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
                await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual([
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
                await withinTransaction((session) =>
                    updateGroupData(
                        { group: 'Uogienės', annual: true, review: false, image: 'data:image/png;base64,AAA' },
                        session
                    )
                );
                vi.clearAllMocks();

                await withinTransaction((session) =>
                    renameGroupData(
                        { group: 'Uogienės', targetGroup: 'Grybai', annual: true, review: false, image: '' },
                        session
                    )
                );

                expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
            });

            it('does not touch image files when image is not provided', async () => {
                await withinTransaction((session) =>
                    renameGroupData({ group: 'Uogienės', targetGroup: 'Grybai' }, session)
                );

                expect(saveImage).not.toHaveBeenCalled();
                expect(deleteImages).not.toHaveBeenCalled();
            });
        });
    });

    describe('deleteGroup', () => {
        it('deletes a group', async () => {
            await expect(withinTransaction((session) => deleteGroupData('Uogienės', session))).resolves.toBe(true);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(
                groups.slice(1)
            );
        });

        it('does nothing with empty group', async () => {
            await expect(withinTransaction((session) => deleteGroupData('', session))).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            await expect(withinTransaction((session) => deleteGroupData('Šaldyti', session))).resolves.toBe(false);
            await expect(withinTransaction((session) => getGroupsData(session))).resolves.toStrictEqual(groups);
        });

        it('keeps the image file for the archived group', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await withinTransaction((session) =>
                updateGroupData(
                    { group: 'Uogienės', annual: true, review: false, image: 'data:image/png;base64,AAA' },
                    session
                )
            );
            vi.clearAllMocks();

            await expect(withinTransaction((session) => deleteGroupData('Uogienės', session))).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('does not touch image files when the group has no image', async () => {
            await expect(withinTransaction((session) => deleteGroupData('Uogienės', session))).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });
    });
});
