import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import type { SetVariantImage } from '~/schema';
import { setVariantImageAction } from '~/server/actions/products';

export function useSetVariantImage(): (request: SetVariantImage, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetVariantImage, onProgress?: UploadProgress): Promise<void> => {
            const { group, name, variant, image } = request;
            if (group && name && variant) {
                trackFaroEvent('data_action', { entity: 'variant', action: 'set_image', result: 'started' });
                try {
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
                    trackFaroEvent('data_action', { entity: 'variant', action: 'set_image', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'variant', action: 'set_image', result: 'error' });
                    throw error;
                }
                if (image.startsWith('data:')) {
                    trackFaroEvent('image_uploaded');
                }
                await refresh();
            }
        },
        [refresh]
    );
}
