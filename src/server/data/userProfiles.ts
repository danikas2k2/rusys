import type { UserProfile } from '~/common/data';
import { db } from '~/server/db';

export async function upsertUserProfile(email: string, name?: string, picture?: string): Promise<boolean> {
    const cleanEmail = (email ?? '').trim().toLowerCase();
    if (!cleanEmail) {
        return false;
    }

    const $set: Partial<UserProfile> & { updatedAt: number } = {
        updatedAt: Date.now(),
    };
    if (name) {
        $set.name = name;
    }
    if (picture) {
        $set.picture = picture;
    }

    const result = await (
        await db()
    )
        .collection<UserProfile & { updatedAt: number }>('user_profiles')
        .updateOne({ email: cleanEmail }, { $set, $setOnInsert: { email: cleanEmail } }, { upsert: true });

    return !!(result.upsertedCount || result.modifiedCount);
}

export async function getUserProfiles(emails: readonly string[]): Promise<readonly UserProfile[]> {
    const clean = [...new Set((emails ?? []).map((e) => (e ?? '').trim().toLowerCase()).filter(Boolean))];
    if (!clean.length) {
        return [];
    }

    return (await db())
        .collection<UserProfile>('user_profiles')
        .find({ email: { $in: clean } }, { projection: { _id: 0, email: 1, name: 1, picture: 1, updatedAt: 1 } })
        .toArray();
}
