import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import { setProductImageAction } from '~/server/actions/products';

export function useSetProductImage(): (
    group: string,
    name: string,
    image: string,
    onProgress?: UploadProgress
) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, image: string, onProgress?: UploadProgress): Promise<void> => {
            if (group && name) {
                if (onProgress && image.startsWith('data:')) {
                    await uploadWithProgress(
                        'PUT',
                        `/api/v1/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}/image`,
                        JSON.stringify({ image }),
                        onProgress
                    );
                } else {
                    await setProductImageAction(group, name, image);
                }
                await refresh();
            }
        },
        [refresh]
    );
}
