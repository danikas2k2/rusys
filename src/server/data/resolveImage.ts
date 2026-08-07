import { classifyImage, deleteImageRef, saveImage } from '~/server/data/images';
import type { ImageRef } from '~/types/data';

// Resolves the image value to persist: uploads and classifies a freshly-dropped data URL
// (deleting the file(s) it replaces), deletes the old file(s) when the image was removed, or
// keeps the previous value as-is when unchanged - a legacy plain-string value left untouched here
// is backfilled later by the read path (getProducts/getGroups), not by this write path.
export async function resolveImage(image: string, previousImage?: ImageRef | string): Promise<ImageRef | undefined> {
    if (image.startsWith('data:')) {
        const saved = await saveImage(image);
        const classified = await classifyImage(saved);
        await deleteImageRef(previousImage);
        return classified;
    }
    const previousUrl = typeof previousImage === 'string' ? previousImage : previousImage?.url;
    if (image !== previousUrl) {
        await deleteImageRef(previousImage);
        return undefined;
    }
    return typeof previousImage === 'string' ? { url: previousImage } : previousImage;
}
