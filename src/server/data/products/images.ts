import type { Product } from '@rusys/common/data';

import { imageFieldUpdate, resolveImage } from '~/server/data/resolveImage';
import { hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';

export async function setImage(group: string, name: string, image: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    const existing = await col.findOne({ group, name });
    const resolved = await resolveImage(image, existing?.image, existing?.photo);
    const { $set, $unset } = imageFieldUpdate(resolved, 'image', 'photo');
    return col
        .updateOne(
            { group, name },
            { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) }
        )
        .then(hasEffect);
}

export async function setVariantImage(group: string, name: string, variant: string, image: string): Promise<boolean> {
    if (!group || !name || !variant) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    const existing = await col.findOne({ group, name });
    const resolved = await resolveImage(image, existing?.variantImages?.[variant], existing?.variantPhotos?.[variant]);
    const { $set, $unset } = imageFieldUpdate(resolved, `variantImages.${variant}`, `variantPhotos.${variant}`);
    return col
        .updateOne(
            { group, name },
            { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) }
        )
        .then(hasEffect);
}
