import { handleAdd } from '~/server/api/handleAdd';
import { handleCheckUser } from '~/server/api/handleCheckUser';
import { handleClientId } from '~/server/api/handleClientId';
import { handleCopyVariant } from '~/server/api/handleCopyVariant';
import { handleDelete } from '~/server/api/handleDelete';
import { handleDeleteGroup } from '~/server/api/handleDeleteGroup';
import { handleDeleteVariant } from '~/server/api/handleDeleteVariant';
import { handleExport } from '~/server/api/handleExport';
import { handleGroups } from '~/server/api/handleGroups';
import { handleImport } from '~/server/api/handleImport';
import { handleMove } from '~/server/api/handleMove';
import { handleProductHistory } from '~/server/api/handleProductHistory';
import { handleProducts } from '~/server/api/handleProducts';
import { handleRedoProduct } from '~/server/api/handleRedoProduct';
import { handleRename } from '~/server/api/handleRename';
import { handleRenameGroup } from '~/server/api/handleRenameGroup';
import { handleRenameVariant } from '~/server/api/handleRenameVariant';
import { handleReorderGroups } from '~/server/api/handleReorderGroups';
import { handleReorderVariants } from '~/server/api/handleReorderVariants';
import { handleSetImage } from '~/server/api/handleSetImage';
import { handleSetMissing } from '~/server/api/handleSetMissing';
import { handleSetMissingBulk } from '~/server/api/handleSetMissingBulk';
import { handleSetRemoving } from '~/server/api/handleSetRemoving';
import { handleSummary } from '~/server/api/handleSummary';
import { handleSummaryHistory } from '~/server/api/handleSummaryHistory';
import { handleUndoProduct } from '~/server/api/handleUndoProduct';
import { handleUpdateGroup } from '~/server/api/handleUpdateGroup';
import { handleUpdateProduct } from '~/server/api/handleUpdateProduct';
import { handleUpdateVariant } from '~/server/api/handleUpdateVariant';
import { handleUpsertUserProfile } from '~/server/api/handleUpsertUserProfile';
import { handleUserProfiles } from '~/server/api/handleUserProfiles';
import { handleVariants } from '~/server/api/handleVariants';
import { ApiUrl, type ApiRequest, type ApiResponse } from '~/types/api';

export const ApiUrlHandlers: Record<ApiUrl, (req: ApiRequest<never>, res: ApiResponse) => Promise<void>> = {
    [ApiUrl.Export]: handleExport,
    [ApiUrl.Import]: handleImport,
    [ApiUrl.ClientId]: handleClientId,
    [ApiUrl.CheckUser]: handleCheckUser,
    [ApiUrl.UserProfileUpsert]: handleUpsertUserProfile,
    [ApiUrl.UserProfiles]: handleUserProfiles,
    [ApiUrl.Summary]: handleSummary,
    [ApiUrl.SummaryHistory]: handleSummaryHistory,
    [ApiUrl.Products]: handleProducts,
    [ApiUrl.ProductsAdd]: handleAdd,
    [ApiUrl.ProductsUpdate]: handleUpdateProduct,
    [ApiUrl.ProductsUndo]: handleUndoProduct,
    [ApiUrl.ProductsRedo]: handleRedoProduct,
    [ApiUrl.ProductsHistory]: handleProductHistory,
    [ApiUrl.ProductsSetRemoving]: handleSetRemoving,
    [ApiUrl.ProductsSetMissing]: handleSetMissing,
    [ApiUrl.ProductsSetMissingBulk]: handleSetMissingBulk,
    [ApiUrl.ProductsSetImage]: handleSetImage,
    [ApiUrl.ProductsRename]: handleRename,
    [ApiUrl.ProductsMove]: handleMove,
    [ApiUrl.ProductsDelete]: handleDelete,
    [ApiUrl.Groups]: handleGroups,
    [ApiUrl.GroupsUpdate]: handleUpdateGroup,
    [ApiUrl.GroupsReorder]: handleReorderGroups,
    [ApiUrl.GroupsRename]: handleRenameGroup,
    [ApiUrl.GroupsDelete]: handleDeleteGroup,
    [ApiUrl.Variants]: handleVariants,
    [ApiUrl.VariantsUpdate]: handleUpdateVariant,
    [ApiUrl.VariantsReorder]: handleReorderVariants,
    [ApiUrl.VariantsRename]: handleRenameVariant,
    [ApiUrl.VariantsCopy]: handleCopyVariant,
    [ApiUrl.VariantsDelete]: handleDeleteVariant,
};
