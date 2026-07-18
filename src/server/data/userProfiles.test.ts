/** @jest-environment node */
import { $all } from '~/server/data/tests/utils';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';
import { db } from '~/server/db';

jest.setTimeout(30_000);

jest.mock('~/server/db');

describe('userProfiles', () => {
    afterEach(async () => {
        await (await db()).collection('user_profiles').deleteMany({});
    });

    describe('upsertUserProfile', () => {
        it('returns false when email is empty string', async () => {
            await expect(upsertUserProfile('')).resolves.toBeFalse();
        });

        it('returns false when email is whitespace only', async () => {
            await expect(upsertUserProfile('   ')).resolves.toBeFalse();
        });

        it('returns false when email is null-like (empty after trim)', async () => {
            await expect(upsertUserProfile('\t\n')).resolves.toBeFalse();
        });

        it('returns true on first insert (upsertedCount > 0)', async () => {
            await expect(upsertUserProfile('user@example.com')).resolves.toBeTrue();
        });

        it('returns true when updating an existing profile (modifiedCount > 0)', async () => {
            await upsertUserProfile('user@example.com', 'Alice');

            await expect(upsertUserProfile('user@example.com', 'Alice Updated')).resolves.toBeTrue();
        });

        it('normalises email by trimming whitespace', async () => {
            await upsertUserProfile('  user@example.com  ');
            const profiles = await $all('user_profiles');

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'user@example.com' });
        });

        it('normalises email to lowercase', async () => {
            await upsertUserProfile('User@Example.COM');
            const profiles = await $all('user_profiles');

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'user@example.com' });
        });

        it('does not include name in $set when name is undefined', async () => {
            await upsertUserProfile('user@example.com', undefined);
            const profiles = await $all('user_profiles');

            expect(profiles[0]).not.toHaveProperty('name');
        });

        it('does not include picture in $set when picture is undefined', async () => {
            await upsertUserProfile('user@example.com', 'Alice', undefined);
            const profiles = await $all('user_profiles');

            expect(profiles[0]).not.toHaveProperty('picture');
        });

        it('sets name when provided', async () => {
            await upsertUserProfile('user@example.com', 'Alice');
            const profiles = await $all('user_profiles');

            expect(profiles[0]).toMatchObject({ name: 'Alice' });
        });

        it('sets picture when provided', async () => {
            await upsertUserProfile('user@example.com', undefined, 'https://example.com/pic.jpg');
            const profiles = await $all('user_profiles');

            expect(profiles[0]).toMatchObject({ picture: 'https://example.com/pic.jpg' });
        });

        it('treats two inserts with same normalised email as one document', async () => {
            await upsertUserProfile('User@Example.COM');
            await upsertUserProfile('user@example.com');
            const profiles = await $all('user_profiles');

            expect(profiles).toHaveLength(1);
        });
    });

    describe('getUserProfiles', () => {
        beforeEach(async () => {
            await upsertUserProfile('alice@example.com', 'Alice', 'https://example.com/alice.jpg');
            await upsertUserProfile('bob@example.com', 'Bob');
        });

        it('returns empty array when emails array is empty', async () => {
            await expect(getUserProfiles([])).resolves.toStrictEqual([]);
        });

        it('returns profiles for known emails', async () => {
            const profiles = await getUserProfiles(['alice@example.com']);

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'alice@example.com', name: 'Alice' });
        });

        it('returns multiple profiles', async () => {
            const profiles = await getUserProfiles(['alice@example.com', 'bob@example.com']);

            expect(profiles).toHaveLength(2);
        });

        it('returns empty array for unknown emails', async () => {
            await expect(getUserProfiles(['unknown@example.com'])).resolves.toStrictEqual([]);
        });

        it('deduplicates emails', async () => {
            const profiles = await getUserProfiles(['alice@example.com', 'alice@example.com']);

            expect(profiles).toHaveLength(1);
        });

        it('normalises emails to lowercase before querying', async () => {
            const profiles = await getUserProfiles(['ALICE@EXAMPLE.COM']);

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'alice@example.com' });
        });

        it('normalises emails by trimming whitespace before querying', async () => {
            const profiles = await getUserProfiles(['  alice@example.com  ']);

            expect(profiles).toHaveLength(1);
        });

        it('does not return _id field', async () => {
            const profiles = await getUserProfiles(['alice@example.com']);

            expect(profiles[0]).not.toHaveProperty('_id');
        });

        it('filters out blank entries in emails array', async () => {
            const profiles = await getUserProfiles(['', '  ', 'alice@example.com']);

            expect(profiles).toHaveLength(1);
            expect(profiles[0]).toMatchObject({ email: 'alice@example.com' });
        });
    });
});
