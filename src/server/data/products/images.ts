import type { ClientSession } from 'mongodb';

import type { Product, SetProductImage, SetVariantImage } from '~/schema';
import { imageFieldUpdate, resolveImage } from '~/server/data/resolveImage';
import { hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';

export async function setImage({ group, name, image }: SetProductImage, session: ClientSession): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    const existing = await col.findOne({ group, name }, { session });
    const resolved = await resolveImage(image, existing?.image, existing?.photo);
    const { $set, $unset } = imageFieldUpdate(resolved, 'image', 'photo');
    return col
        .updateOne(
            { group, name },
            { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) },
            { session }
        )
        .then(hasEffect);
}

export async function setVariantImage(
    { group, name, variant, image }: SetVariantImage,
    session: ClientSession
): Promise<boolean> {
    if (!group || !name || !variant) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    const existing = await col.findOne({ group, name }, { session });
    const resolved = await resolveImage(image, existing?.variantImages?.[variant], existing?.variantPhotos?.[variant]);
    const { $set, $unset } = imageFieldUpdate(resolved, `variantImages.${variant}`, `variantPhotos.${variant}`);
    return col
        .updateOne(
            { group, name },
            { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) },
            { session }
        )
        .then(hasEffect);
}
