import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import type { SetVariantImage } from '~/schema';
import { setVariantImageAction } from '~/server/actions/products';

export function useSetVariantImage(): (request: SetVariantImage, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetVariantImage, onProgress?: UploadProgress): Promise<void> => {
            const { group, name, variant, image } = request;
            if (group && name && variant) {
                if (onProgress && image.startsWith('data:')) {
                    await uploadWithProgress(
                        'PUT',
                        `/api/v1/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/variants/${encodeURIComponent(variant)}/image`,
                        JSON.stringify({ image }),
                        onProgress
                    );
                } else {
                    await setVariantImageAction(request);
                }
                await refresh();
            }
        },
        [refresh]
    );
}
