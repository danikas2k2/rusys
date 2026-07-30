import { deleteImage, saveImage } from '~/server/data/images';

// Resolves the image value to persist: uploads a new file for a freshly-dropped data URL
// (deleting the old one it replaces), or deletes the old file when the image was removed.
export async function resolveImage(image: string, previousImage?: string): Promise<string> {
    if (image.startsWith('data:')) {
        const saved = await saveImage(image);
        await deleteImage(previousImage);
        return saved;
    }
    if (image !== previousImage) {
        await deleteImage(previousImage);
    }
    return image;
}
