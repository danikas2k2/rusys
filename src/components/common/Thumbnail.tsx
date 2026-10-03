'use client';

import { Avatar, type AvatarProps } from '@mantine/core';
import Image from 'next/image';
import React, { useState } from 'react';

import { localImageLoader } from '~/lib/utils/localImageLoader';

interface ThumbnailProps extends Omit<AvatarProps, 'src' | 'alt' | 'children' | 'imageProps'> {
    src?: string | null;
    alt: string;
    fallback: React.ReactNode;
    role?: React.AriaRole;
    title?: string;
}

const imageSizes: Record<string, number> = { xs: 16, sm: 26, md: 38, lg: 56, xl: 84 };

function getImageSize(size: AvatarProps['size']): number {
    if (typeof size === 'number') {
        return size;
    }
    if (size?.endsWith('rem')) {
        return Math.round(Number.parseFloat(size) * 16);
    }
    if (size?.endsWith('px')) {
        return Math.round(Number.parseFloat(size));
    }
    return imageSizes[size ?? 'md'] ?? imageSizes.md!;
}

function normalizeImageSrc(src?: string | null): string {
    if (!src) {
        return '';
    }
    return src.startsWith('/') || src.includes('://') || src.startsWith('data:') ? src : `/${src}`;
}

export function Thumbnail({
    src,
    alt,
    fallback,
    size = 56,
    radius = 'md',
    ...avatarProps
}: ThumbnailProps): React.JSX.Element {
    const [failedSrc, setFailedSrc] = useState<string | undefined>();
    const pixels = getImageSize(size);
    const imageSrc = normalizeImageSrc(src);

    return (
        <Avatar size={size} radius={radius} alt={alt} {...avatarProps}>
            {src && src !== failedSrc ? (
                <Image
                    src={imageSrc}
                    alt={alt}
                    loader={src.startsWith('/images/') ? localImageLoader : undefined}
                    width={pixels}
                    height={pixels}
                    unoptimized={src.includes('://') || src.startsWith('data:')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setFailedSrc(src)}
                />
            ) : (
                fallback
            )}
        </Avatar>
    );
}
