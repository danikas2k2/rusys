import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import { type UploadProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError, type SetVariantImage } from '~/schema';
import { setVariantImageAction } from '~/server/actions/products';

export function useSetVariantImage(): (request: SetVariantImage, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetVariantImage, _onProgress?: UploadProgress): Promise<void> => {
            const { group, name, variant, image } = request;
            if (group && name && variant) {
                trackFaroEvent('data_action', { entity: 'variant', action: 'set_image', result: 'started' });
                try {
                    const result = await setVariantImageAction(request);
                    if (result?.imageUnavailable) {
                        await refresh();
                        throw new Error(SchemaError.ImageUnavailable);
                    }
                    trackFaroEvent('data_action', { entity: 'variant', action: 'set_image', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'variant', action: 'set_image', result: 'error' });
                    throw error;
                }
                if (image.startsWith('upload:')) {
                    trackFaroEvent('image_uploaded');
                }
                await refresh();
            }
        },
        [refresh]
    );
}
