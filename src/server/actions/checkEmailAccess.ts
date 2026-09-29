'use server';

import { isDevMode } from '~/common/utils/dev';

export async function checkEmailAccess(email: string): Promise<boolean> {
    if (typeof email !== 'string' || !email) {
        throw new Error('Email is required');
    }
    return process.env.GOOGLE_ALLOWED_USERS?.split(',').includes(email) || isDevMode();
}
