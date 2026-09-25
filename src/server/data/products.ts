/**
 * Public product-data API.
 *
 * The implementation is split by responsibility in `products/`; keeping this
 * façade preserves one stable import path for API handlers and tests.
 */
export { getProducts, getProductsWithYears, getProductVariants } from './products/read';
export { setImage, setVariantImage } from './products/images';
export {
    addProduct,
    deleteProduct,
    deleteProductsGroup,
    deleteProductsVariant,
    moveProduct,
    renameProduct,
    renameProductsGroup,
    renameProductsVariant,
    setProductExpiryTolerance,
    setProductParent,
} from './products/mutations';
export {
    cleanupRecycled,
    getProductUndates,
    getProductUpdates,
    hasAmount,
    moveConsumedToRecycled,
    redoProduct,
    setAmounts,
    setMissing,
    setMissingBulk,
    setRemoving,
    transferAmounts,
    undoProduct,
} from './products/stock';
