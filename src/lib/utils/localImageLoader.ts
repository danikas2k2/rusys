import type { ImageLoaderProps } from 'next/image';

export function localImageLoader({ src, width }: ImageLoaderProps): string {
    const url = new URL(src, 'http://localhost');
    url.searchParams.set('w', String(width));
    return `${url.pathname}${url.search}`;
}
