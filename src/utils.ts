import { readFile } from 'fs/promises';

export const cmp = <T extends any>(a: T, b: T) => (a < b ? -1 : +(a > b));

export const readConfig = async <T = any>(): Promise<T> => {
    const content = await readFile('config.json', 'utf8');
    return content && JSON.parse(content);
};
