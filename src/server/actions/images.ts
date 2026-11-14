'use server';

import { requireSession } from '~/server/auth/session';
import { dropStagedImage } from '~/server/data/stagedImages';

export async function dropImageAction(token: string): Promise<void> {
    const { email } = await requireSession();
    if (typeof token !== 'string' || !email) {
        return;
    }
    await dropStagedImage(token, email);
}
