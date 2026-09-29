'use server';

import { DEV_CLIENT_ID, isDevMode } from '~/common/utils/dev';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';

const STALE_MS = 14 * 24 * 60 * 60 * 1000;

export interface UserProfileInput {
    email: string;
    name?: string;
    picture?: string;
}

export async function syncUserProfile(input: UserProfileInput): Promise<void> {
    const { email, name, picture } = input;
    if (
        typeof email !== 'string' ||
        !email.trim() ||
        (name !== undefined && typeof name !== 'string') ||
        (picture !== undefined && typeof picture !== 'string')
    ) {
        return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const allowed =
        isDevMode() ||
        process.env.GOOGLE_CLIENT_ID === DEV_CLIENT_ID ||
        process.env.GOOGLE_ALLOWED_USERS?.split(',').some((user) => user.trim().toLowerCase() === cleanEmail);
    if (!allowed) {
        return;
    }

    const [existing] = await getUserProfiles([cleanEmail]);
    const changed =
        (name !== undefined && name !== existing?.name) || (picture !== undefined && picture !== existing?.picture);
    if (!existing || changed || !existing.updatedAt || Date.now() - existing.updatedAt > STALE_MS) {
        await upsertUserProfile(cleanEmail, name, picture);
    }
}
