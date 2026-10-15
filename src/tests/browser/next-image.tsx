import React from 'react';

export default function Image(
    props: React.ComponentProps<'img'> & {
        loader?: (options: { src: string; width: number }) => string;
        unoptimized?: boolean;
    }
) {
    const { loader, unoptimized: _unoptimized, ...imageProps } = props;
    const src =
        typeof imageProps.src === 'string' && loader
            ? loader({ src: imageProps.src, width: Number(imageProps.width) })
            : imageProps.src;
    return <img {...imageProps} alt={imageProps.alt ?? ''} src={src} />;
}
