import React, { useCallback } from 'react';

import { ImageDropzone } from '~/components/images/ImageDropzone';
import { useStagedImage } from '~/components/images/useStagedImage';
import { useSetVariantImage } from '~/features/products/hooks/useSetVariantImage';
import { useLabels } from '~/lib/hooks/useLabels';

interface VariantImagePickerProps {
    group: string;
    name: string;
    variant: string;
    image?: string;
}

export function VariantImagePicker({ group, name, variant, image }: VariantImagePickerProps): React.ReactElement {
    const _ = useLabels();
    const setVariantImage = useSetVariantImage();
    const { drop, progress } = useStagedImage(true, () => undefined);

    const handleDrop = useCallback(
        async (dataUrl: string) => {
            const token = await drop(dataUrl);
            if (token) {
                await setVariantImage({ group, name, variant, image: token });
            }
        },
        [group, name, variant, setVariantImage, drop]
    );

    const handleRemove = useCallback(
        () => setVariantImage({ group, name, variant, image: '' }),
        [group, name, variant, setVariantImage]
    );

    return (
        <ImageDropzone
            image={image}
            label={_('Variant image')}
            onDrop={handleDrop}
            onRemove={handleRemove}
            progress={progress}
            compact
        />
    );
}
