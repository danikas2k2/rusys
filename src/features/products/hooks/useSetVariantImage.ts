import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import { setVariantImageAction } from '~/server/actions/products';

export function useSetVariantImage(): (
    group: string,
    name: string,
    variant: string,
    image: string,
    onProgress?: UploadProgress
) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (
            group: string,
            name: string,
            variant: string,
            image: string,
            onProgress?: UploadProgress
        ): Promise<void> => {
            if (group && name && variant) {
                if (onProgress && image.startsWith('data:')) {
                    await uploadWithProgress(
                        'PUT',
                        `/api/v1/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/variants/${encodeURIComponent(variant)}/image`,
                        JSON.stringify({ image }),
                        onProgress
                    );
                } else {
                    await setVariantImageAction(group, name, variant, image);
                }
                await refresh();
            }
        },
        [refresh]
    );
}
