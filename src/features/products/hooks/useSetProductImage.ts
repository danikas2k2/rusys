import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import type { SetProductImage } from '~/schema';
import { setProductImageAction } from '~/server/actions/products';

export function useSetProductImage(): (request: SetProductImage, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetProductImage, onProgress?: UploadProgress): Promise<void> => {
            const { group, name, image } = request;
            if (group && name) {
                if (onProgress && image.startsWith('data:')) {
                    await uploadWithProgress(
                        'PUT',
                        `/api/v1/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/image`,
                        JSON.stringify({ image }),
                        onProgress
                    );
                } else {
                    await setProductImageAction(request);
                }
                await refresh();
            }
        },
        [refresh]
    );
}
