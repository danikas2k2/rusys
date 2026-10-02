import React, { useCallback } from 'react';

import { ImageDropzone } from '~/components/images/ImageDropzone';
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

    const handleDrop = useCallback(
        (dataUrl: string) => setVariantImage(group, name, variant, dataUrl),
        [group, name, variant, setVariantImage]
    );

    const handleRemove = useCallback(
        () => setVariantImage(group, name, variant, ''),
        [group, name, variant, setVariantImage]
    );

    return (
        <ImageDropzone image={image} label={_('Variant image')} onDrop={handleDrop} onRemove={handleRemove} compact />
    );
}
