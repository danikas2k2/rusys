import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import { type UploadProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError, type SetProductImage } from '~/schema';
import { setProductImageAction } from '~/server/actions/products';

export function useSetProductImage(): (request: SetProductImage, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetProductImage, _onProgress?: UploadProgress): Promise<void> => {
            const { group, name, image } = request;
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'product', action: 'set_image', result: 'started' });
                try {
                    const result = await setProductImageAction(request);
                    if (result?.imageUnavailable) {
                        await refresh();
                        throw new Error(SchemaError.ImageUnavailable);
                    }
                    trackFaroEvent('data_action', { entity: 'product', action: 'set_image', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'product', action: 'set_image', result: 'error' });
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
