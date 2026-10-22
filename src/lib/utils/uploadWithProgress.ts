import { SchemaError } from '~/schema';

export type UploadProgress = (percent: number) => void;

export function uploadWithProgress(
    method: 'POST' | 'PUT' | 'PATCH',
    url: string,
    body: FormData | string,
    onProgress?: UploadProgress
): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open(method, url);
        if (typeof body === 'string') {
            request.setRequestHeader('Content-Type', 'application/json');
        }
        request.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
                onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
            }
        };
        request.onerror = () => reject(new Error(SchemaError.UploadFailed));
        request.onabort = () => reject(new Error(SchemaError.UploadCancelled));
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                resolve();
                return;
            }
            reject(new Error(SchemaError.UploadFailed));
        };
        request.send(body);
    });
}
