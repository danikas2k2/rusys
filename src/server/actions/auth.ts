'use server';

import { OAuth2Client } from 'google-auth-library';

import { createSession, deleteSession, isAllowedEmail } from '~/server/auth/session';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';
import type { Profile } from '~/store/profile/types';

const STALE_MS = 14 * 24 * 60 * 60 * 1000;

export async function loginWithGoogle(token: string, kind: 'id' | 'access'): Promise<Profile> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || typeof token !== 'string' || !token || (kind !== 'id' && kind !== 'access')) {
        throw new Error('Invalid login');
    }
    const client = new OAuth2Client(clientId);
    let profile: Profile;
    if (kind === 'id') {
        const ticket = await client.verifyIdToken({ idToken: token, audience: clientId });
        const payload = ticket.getPayload();
        profile = {
            sub: payload?.sub,
            email: payload?.email,
            email_verified: payload?.email_verified,
            name: payload?.name,
            picture: payload?.picture,
        };
    } else {
        const info = await client.getTokenInfo(token);
        if (info.aud !== clientId) {
            throw new Error('Invalid token audience');
        }
        const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error('Google userinfo failed');
        }
        profile = (await response.json()) as Profile;
        const subject = info.sub ?? info.user_id;
        if (!subject || profile.sub !== subject) {
            throw new Error('Google identity mismatch');
        }
    }
    if (!profile.sub || !profile.email || profile.email_verified !== true || !isAllowedEmail(profile.email)) {
        throw new Error('User is not allowed');
    }
    const verifiedProfile: Profile = {
        sub: profile.sub,
        email: profile.email.trim().toLowerCase(),
        name: profile.name,
        picture: profile.picture,
        allowed: true,
    };
    const [existing] = await getUserProfiles([verifiedProfile.email!]);
    if (
        !existing ||
        existing.name !== verifiedProfile.name ||
        existing.picture !== verifiedProfile.picture ||
        !existing.updatedAt ||
        Date.now() - existing.updatedAt > STALE_MS
    ) {
        await upsertUserProfile(verifiedProfile.email!, verifiedProfile.name, verifiedProfile.picture);
    }
    await createSession(verifiedProfile);
    return verifiedProfile;
}

export async function logout(): Promise<void> {
    await deleteSession();
}
