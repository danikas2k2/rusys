import { type UploadedFile } from 'express-fileupload';

export function mockUploadedFile(file: Partial<UploadedFile>): UploadedFile;
export function mockUploadedFile(name: string, more?: Partial<UploadedFile>): UploadedFile;
export function mockUploadedFile(name: string, data: Buffer | string, more?: Partial<UploadedFile>): UploadedFile;
export function mockUploadedFile(
    name: string | Partial<UploadedFile>,
    data?: Buffer | string | Partial<UploadedFile>,
    more?: Partial<UploadedFile>
): UploadedFile {
    const file: Partial<UploadedFile> = {};
    if (typeof name === 'string') {
        file.name = name;
        if (typeof data === 'string' || Buffer.isBuffer(data)) {
            file.data = Buffer.from(data);
            Object.assign(file, more);
        } else {
            Object.assign(file, data);
        }
    } else {
        Object.assign(file, name);
    }
    // TODO add missing fields
    return file as UploadedFile;
}
