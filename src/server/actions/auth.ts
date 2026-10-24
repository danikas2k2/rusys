'use server';

import { OAuth2Client } from 'google-auth-library';

import { loginWithGoogleSchema, SchemaError, type LoginWithGoogle } from '~/schema';
import { createSession, deleteSession, isAllowedEmail } from '~/server/auth/session';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';
import { withinTransaction } from '~/server/db';
import type { Profile } from '~/store/profile';

const STALE_MS = 14 * 24 * 60 * 60 * 1000;

export async function loginWithGoogle(request: LoginWithGoogle): Promise<Profile> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const input = loginWithGoogleSchema.safeParse(request);
    if (!clientId || !input.success) {
        throw new Error(SchemaError.InvalidLogin);
    }

    const { token, kind } = input.data;
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
            throw new Error(SchemaError.InvalidTokenAudience);
        }

        const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error(SchemaError.GoogleUserInfoFailed);
        }

        profile = (await response.json()) as Profile;
        const subject = info.sub ?? info.user_id;
        if (!subject || profile.sub !== subject) {
            throw new Error(SchemaError.GoogleIdentityMismatch);
        }
    }

    if (!profile.sub || !profile.email || profile.email_verified !== true || !isAllowedEmail(profile.email)) {
        throw new Error(SchemaError.UserNotAllowed);
    }

    const verifiedProfile: Profile = {
        sub: profile.sub,
        email: profile.email.trim().toLowerCase(),
        name: profile.name,
        picture: profile.picture,
        allowed: true,
    };
    await withinTransaction(async (session) => {
        const [existing] = await getUserProfiles([verifiedProfile.email!], session);
        if (
            !existing ||
            existing.name !== verifiedProfile.name ||
            existing.picture !== verifiedProfile.picture ||
            !existing.updatedAt ||
            Date.now() - existing.updatedAt > STALE_MS
        ) {
            await upsertUserProfile(
                { email: verifiedProfile.email!, name: verifiedProfile.name, picture: verifiedProfile.picture },
                session
            );
        }

        return true;
    });

    await createSession(verifiedProfile);
    return verifiedProfile;
}

export async function logout(): Promise<void> {
    await deleteSession();
}
