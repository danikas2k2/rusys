import { $all } from '~/server/data/tests/utils';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';
import { db, withinTransaction } from '~/server/db';

vi.mock(import('~/server/db'));

describe('userProfiles', () => {
    vi.setConfig({ testTimeout: 30_000 });

    afterEach(async () => {
        await (await db()).collection('user_profiles').deleteMany({});
    });

    describe('upsertUserProfile', () => {
        it('returns false when email is empty string', async () => {
            await expect(
                withinTransaction((transactionSession) =>
                    upsertUserProfile({ email: '', name: undefined, picture: undefined }, transactionSession)
                )
            ).resolves.toBe(false);
        });

        it('returns false when email is whitespace only', async () => {
            await expect(
                withinTransaction((transactionSession) =>
                    upsertUserProfile({ email: '   ', name: undefined, picture: undefined }, transactionSession)
                )
            ).resolves.toBe(false);
        });

        it('returns false when email is null-like (empty after trim)', async () => {
            await expect(
                withinTransaction((transactionSession) =>
                    upsertUserProfile({ email: '\t\n', name: undefined, picture: undefined }, transactionSession)
                )
            ).resolves.toBe(false);
        });

        it('returns false when email is null (malformed API request body)', async () => {
            await expect(
                withinTransaction((transactionSession) =>
                    upsertUserProfile(
                        { email: null as unknown as string, name: undefined, picture: undefined },
                        transactionSession
                    )
                )
            ).resolves.toBe(false);
        });

        it('returns true on first insert (upsertedCount > 0)', async () => {
            await expect(
                withinTransaction((transactionSession) =>
                    upsertUserProfile(
                        { email: 'user@example.com', name: undefined, picture: undefined },
                        transactionSession
                    )
                )
            ).resolves.toBe(true);
        });

        it('returns true when updating an existing profile (modifiedCount > 0)', async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile({ email: 'user@example.com', name: 'Alice', picture: undefined }, transactionSession)
            );

            await expect(
                withinTransaction((transactionSession) =>
                    upsertUserProfile(
                        { email: 'user@example.com', name: 'Alice Updated', picture: undefined },
                        transactionSession
                    )
                )
            ).resolves.toBe(true);
        });

        it('normalises email by trimming whitespace', async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile(
                    { email: '  user@example.com  ', name: undefined, picture: undefined },
                    transactionSession
                )
            );
            const profiles = await $all('user_profiles');

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'user@example.com' });
        });

        it('normalises email to lowercase', async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile(
                    { email: 'User@Example.COM', name: undefined, picture: undefined },
                    transactionSession
                )
            );
            const profiles = await $all('user_profiles');

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'user@example.com' });
        });

        it('does not include name in $set when name is undefined', async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile(
                    { email: 'user@example.com', name: undefined, picture: undefined },
                    transactionSession
                )
            );
            const profiles = await $all('user_profiles');

            expect(profiles[0]).not.toHaveProperty('name');
        });

        it('does not include picture in $set when picture is undefined', async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile({ email: 'user@example.com', name: 'Alice', picture: undefined }, transactionSession)
            );
            const profiles = await $all('user_profiles');

            expect(profiles[0]).not.toHaveProperty('picture');
        });

        it('sets name when provided', async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile({ email: 'user@example.com', name: 'Alice', picture: undefined }, transactionSession)
            );
            const profiles = await $all('user_profiles');

            expect(profiles[0]).toMatchObject({ name: 'Alice' });
        });

        it('sets picture when provided', async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile(
                    { email: 'user@example.com', name: undefined, picture: 'https://example.com/pic.jpg' },
                    transactionSession
                )
            );
            const profiles = await $all('user_profiles');

            expect(profiles[0]).toMatchObject({ picture: 'https://example.com/pic.jpg' });
        });

        it('treats two inserts with same normalised email as one document', async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile(
                    { email: 'User@Example.COM', name: undefined, picture: undefined },
                    transactionSession
                )
            );
            await withinTransaction((transactionSession) =>
                upsertUserProfile(
                    { email: 'user@example.com', name: undefined, picture: undefined },
                    transactionSession
                )
            );
            const profiles = await $all('user_profiles');

            expect(profiles).toHaveLength(1);
        });
    });

    describe('getUserProfiles', () => {
        beforeEach(async () => {
            await withinTransaction((transactionSession) =>
                upsertUserProfile(
                    { email: 'alice@example.com', name: 'Alice', picture: 'https://example.com/alice.jpg' },
                    transactionSession
                )
            );
            await withinTransaction((transactionSession) =>
                upsertUserProfile({ email: 'bob@example.com', name: 'Bob', picture: undefined }, transactionSession)
            );
        });

        it('returns empty array when emails array is empty', async () => {
            await expect(
                withinTransaction((transactionSession) => getUserProfiles([], transactionSession))
            ).resolves.toStrictEqual([]);
        });

        it('returns empty array when emails is null (malformed API request body)', async () => {
            await expect(
                withinTransaction((transactionSession) =>
                    getUserProfiles(null as unknown as string[], transactionSession)
                )
            ).resolves.toStrictEqual([]);
        });

        it('filters out a null entry in the emails array (malformed API request body)', async () => {
            const profiles = await withinTransaction((transactionSession) =>
                getUserProfiles([null as unknown as string, 'alice@example.com'], transactionSession)
            );

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'alice@example.com' });
        });

        it('returns profiles for known emails', async () => {
            const profiles = await withinTransaction((transactionSession) =>
                getUserProfiles(['alice@example.com'], transactionSession)
            );

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'alice@example.com', name: 'Alice' });
        });

        it('returns multiple profiles', async () => {
            const profiles = await withinTransaction((transactionSession) =>
                getUserProfiles(['alice@example.com', 'bob@example.com'], transactionSession)
            );

            expect(profiles).toHaveLength(2);
        });

        it('returns empty array for unknown emails', async () => {
            await expect(
                withinTransaction((transactionSession) => getUserProfiles(['unknown@example.com'], transactionSession))
            ).resolves.toStrictEqual([]);
        });

        it('deduplicates emails', async () => {
            const profiles = await withinTransaction((transactionSession) =>
                getUserProfiles(['alice@example.com', 'alice@example.com'], transactionSession)
            );

            expect(profiles).toHaveLength(1);
        });

        it('normalises emails to lowercase before querying', async () => {
            const profiles = await withinTransaction((transactionSession) =>
                getUserProfiles(['ALICE@EXAMPLE.COM'], transactionSession)
            );

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'alice@example.com' });
        });

        it('normalises emails by trimming whitespace before querying', async () => {
            const profiles = await withinTransaction((transactionSession) =>
                getUserProfiles(['  alice@example.com  '], transactionSession)
            );

            expect(profiles).toHaveLength(1);
        });

        it('does not return _id field', async () => {
            const profiles = await withinTransaction((transactionSession) =>
                getUserProfiles(['alice@example.com'], transactionSession)
            );

            expect(profiles[0]).not.toHaveProperty('_id');
        });

        it('filters out blank entries in emails array', async () => {
            const profiles = await withinTransaction((transactionSession) =>
                getUserProfiles(['', '  ', 'alice@example.com'], transactionSession)
            );

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'alice@example.com' });
        });
    });
});
