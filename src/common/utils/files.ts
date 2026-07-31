export const IMAGE_EXTENSION_BY_MIME_TYPE: Readonly<Record<string, string>> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
};

export const IMAGE_MIME_TYPES: readonly string[] = Object.keys(IMAGE_EXTENSION_BY_MIME_TYPE);

export const MAX_IMAGE_FILE_MB = 20;

export const MAX_IMAGE_FILE_SIZE = MAX_IMAGE_FILE_MB * 1024 ** 2;

export const MAX_IMPORT_FILE_MB = 200; // in MB - the archive can bundle many product/category images

export const MAX_IMPORT_FILE_SIZE = MAX_IMPORT_FILE_MB * 1024 ** 2;
