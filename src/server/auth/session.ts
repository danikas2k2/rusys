import { createHash, randomBytes } from 'node:crypto';

import { cookies } from 'next/headers';

import { isDevMode } from '~/common/utils/dev';
import { db } from '~/server/db';
import { DEV_MODE_PROFILE } from '~/store/profile/dev';
import type { Profile } from '~/store/profile/types';

const COOKIE = 'rusys_session';
const SESSION_AGE = 30 * 24 * 60 * 60;

function hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export function isAllowedEmail(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    return (
        !!normalized &&
        (isDevMode() ||
            !!process.env.GOOGLE_ALLOWED_USERS?.split(',').some(
                (allowed) => allowed.trim().toLowerCase() === normalized
            ))
    );
}

export async function getSessionProfile(): Promise<Profile | undefined> {
    if (isDevMode()) {
        return { ...DEV_MODE_PROFILE, allowed: true };
    }
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
        return undefined;
    }
    const session = await (
        await db()
    )
        .collection<{ tokenHash: string; profile: Profile; expiresAt: Date }>('sessions')
        .findOne({ tokenHash: hash(token), expiresAt: { $gt: new Date() } });
    return session?.profile.email && isAllowedEmail(session.profile.email) ? session.profile : undefined;
}

export async function requireSession(): Promise<Profile> {
    const profile = await getSessionProfile();
    if (!profile) {
        throw new Error('Unauthorized');
    }
    return profile;
}

export async function createSession(profile: Profile): Promise<void> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_AGE * 1000);
    await (await db()).collection('sessions').insertOne({ tokenHash: hash(token), profile, expiresAt });
    (await cookies()).set(COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
    });
}

export async function deleteSession(): Promise<void> {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (token) {
        await (await db()).collection('sessions').deleteOne({ tokenHash: hash(token) });
    }
    jar.delete(COOKIE);
}
