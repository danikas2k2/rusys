import { classifyImage, deleteImages, saveImage, type ClassifiedImage } from '~/server/data/images';

// Resolves the image/photo pair to persist: uploads and classifies a freshly-dropped data URL
// (deleting the file(s) it replaces), deletes the file(s) when the image was removed, or keeps
// the previous image/photo pair as-is when unchanged. The client sends a fresh upload, the
// existing URL, or an empty string.
export async function resolveImage(
    image: string,
    previousImage?: string,
    previousPhoto?: string
): Promise<Partial<ClassifiedImage>> {
    if (image.startsWith('data:')) {
        const saved = await saveImage(image);
        const classified = await classifyImage(saved);
        await deleteImages(previousImage, previousPhoto);
        return classified;
    }
    if (image !== previousImage) {
        await deleteImages(previousImage, previousPhoto);
        return {};
    }
    return { image: previousImage, ...(previousPhoto ? { photo: previousPhoto } : {}) };
}

// Turns a resolved image/photo pair into the update to apply for a given pair of field names -
// each field is $set when present, $unset when not, so a removed image/photo doesn't linger.
export function imageFieldUpdate(
    resolved: Partial<ClassifiedImage>,
    imageField: string,
    photoField: string
): { $set: Record<string, string>; $unset: Record<string, 1> } {
    const $set: Record<string, string> = {};
    const $unset: Record<string, 1> = {};
    if (resolved.image) {
        $set[imageField] = resolved.image;
    } else {
        $unset[imageField] = 1;
    }
    if (resolved.photo) {
        $set[photoField] = resolved.photo;
    } else {
        $unset[photoField] = 1;
    }
    return { $set, $unset };
}
