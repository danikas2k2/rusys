import { Router } from 'express';

import { handleAccess } from '~/server/api/v1/handleAccess';
import { handleAuthClientId } from '~/server/api/v1/handleAuthClientId';
import { handleCreateProduct } from '~/server/api/v1/handleCreateProduct';
import { handleDeleteGroup } from '~/server/api/v1/handleDeleteGroup';
import { handleDeleteProduct } from '~/server/api/v1/handleDeleteProduct';
import { handleDeleteVariant } from '~/server/api/v1/handleDeleteVariant';
import { handleExportLatest } from '~/server/api/v1/handleExportLatest';
import { handleGetGroups } from '~/server/api/v1/handleGetGroups';
import { handleGetProductHistory } from '~/server/api/v1/handleGetProductHistory';
import { handleGetProducts } from '~/server/api/v1/handleGetProducts';
import { handleGetProductSummaryHistory } from '~/server/api/v1/handleGetProductSummaryHistory';
import { handleGetSummary } from '~/server/api/v1/handleGetSummary';
import { handleGetUserProfiles } from '~/server/api/v1/handleGetUserProfiles';
import { handleGetVariants } from '~/server/api/v1/handleGetVariants';
import { handleImport } from '~/server/api/v1/handleImport';
import { handlePatchGroup } from '~/server/api/v1/handlePatchGroup';
import { handlePatchProduct } from '~/server/api/v1/handlePatchProduct';
import { handlePatchVariant } from '~/server/api/v1/handlePatchVariant';
import { handlePostAmountHistory } from '~/server/api/v1/handlePostAmountHistory';
import { handlePostAmountHistoryRedo } from '~/server/api/v1/handlePostAmountHistoryRedo';
import { handlePostAmountHistoryUndo } from '~/server/api/v1/handlePostAmountHistoryUndo';
import { handlePostVariantCopy } from '~/server/api/v1/handlePostVariantCopy';
import { handleProductReviewStatuses } from '~/server/api/v1/handleProductReviewStatuses';
import { handlePutGroup } from '~/server/api/v1/handlePutGroup';
import { handlePutGroupsOrder } from '~/server/api/v1/handlePutGroupsOrder';
import { handlePutProductAmounts } from '~/server/api/v1/handlePutProductAmounts';
import { handlePutProductImage } from '~/server/api/v1/handlePutProductImage';
import { handlePutProductVariantImage } from '~/server/api/v1/handlePutProductVariantImage';
import { handlePutUserProfile } from '~/server/api/v1/handlePutUserProfile';
import { handlePutVariantsOrder } from '~/server/api/v1/handlePutVariantsOrder';
import { handleSetProductYear } from '~/server/api/v1/handleSetProductYear';

export function createV1Router(): Router {
    const router = Router();
    router.use((_, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        next();
    });

    router.get('/auth/client-id', handleAuthClientId);
    router.get('/access', handleAccess);

    router.get('/user-profiles', handleGetUserProfiles);
    router.put('/user-profiles/:email', handlePutUserProfile);

    router.get('/groups', handleGetGroups);
    router.put('/groups/:group', handlePutGroup);
    router.patch('/groups/:group', handlePatchGroup);
    router.delete('/groups/:group', handleDeleteGroup);
    router.put('/groups/order', handlePutGroupsOrder);

    router.get('/variants', handleGetVariants);
    router.delete('/groups/:group/variants/:variant', handleDeleteVariant);
    router.patch('/groups/:group/variants/:variant', handlePatchVariant);
    router.post('/groups/:group/variants/:variant/copies', handlePostVariantCopy);
    router.put('/groups/:group/variants/order', handlePutVariantsOrder);

    router.get('/products', handleGetProducts);
    router.post('/products', handleCreateProduct);

    router.patch('/products/review-statuses', handleProductReviewStatuses);
    router.delete('/groups/:group/products/:name', handleDeleteProduct);
    router.patch('/groups/:group/products/:name', handlePatchProduct);
    router.put('/groups/:group/products/:name/image', handlePutProductImage);
    router.put('/groups/:group/products/:name/variants/:variant/image', handlePutProductVariantImage);
    router.put('/groups/:group/products/:name/years/:year/amounts', handlePutProductAmounts);
    router.patch('/groups/:group/products/:name/years/:year', handleSetProductYear);
    router.post('/groups/:group/products/:name/years/:year/amount-history', handlePostAmountHistory);
    router.post('/groups/:group/products/:name/years/:year/amount-history/undo', handlePostAmountHistoryUndo);
    router.post('/groups/:group/products/:name/years/:year/amount-history/redo', handlePostAmountHistoryRedo);
    router.get('/groups/:group/products/:name/years/:year/history', handleGetProductHistory);

    router.get('/summary', handleGetSummary);
    router.get('/groups/:group/products/:name/years/:year/summary-history', handleGetProductSummaryHistory);

    router.get('/exports/latest', handleExportLatest);
    router.post('/imports', handleImport);

    return router;
}
