export const IMAGE_EXTENSION_BY_MIME_TYPE: Readonly<Record<string, string>> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
};

export const IMAGE_MIME_TYPES: readonly string[] = Object.keys(IMAGE_EXTENSION_BY_MIME_TYPE);

export const MAX_IMAGE_FILE_SIZE = 512 * 1024;
