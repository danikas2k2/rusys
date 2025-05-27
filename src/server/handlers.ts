import { handleAdd } from '~/server/api/handleAdd';
import { handleCheckUser } from '~/server/api/handleCheckUser';
import { handleClientId } from '~/server/api/handleClientId';
import { handleCopyVariant } from '~/server/api/handleCopyVariant';
import { handleDelete } from '~/server/api/handleDelete';
import { handleDeleteGroup } from '~/server/api/handleDeleteGroup';
import { handleDeleteVariant } from '~/server/api/handleDeleteVariant';
import { handleDetails } from '~/server/api/handleDetails';
import { handleExport } from '~/server/api/handleExport';
import { handleGroups } from '~/server/api/handleGroups';
import { handleImport } from '~/server/api/handleImport';
import { handleMove } from '~/server/api/handleMove';
import { handleRename } from '~/server/api/handleRename';
import { handleRenameGroup } from '~/server/api/handleRenameGroup';
import { handleRenameVariant } from '~/server/api/handleRenameVariant';
import { handleReorderGroups } from '~/server/api/handleReorderGroups';
import { handleReorderVariants } from '~/server/api/handleReorderVariants';
import { handleSetMissing } from '~/server/api/handleSetMissing';
import { handleSetRemoving } from '~/server/api/handleSetRemoving';
import { handleSummary } from '~/server/api/handleSummary';
import { handleUpdateDetails } from '~/server/api/handleUpdateDetails';
import { handleUpdateGroup } from '~/server/api/handleUpdateGroup';
import { handleUpdateVariant } from '~/server/api/handleUpdateVariant';
import { handleVariants } from '~/server/api/handleVariants';
import { ApiUrl, type ApiRequest, type ApiResponse } from '~/types/api';

export const ApiUrlHandlers: Record<ApiUrl, (req: ApiRequest<never>, res: ApiResponse) => Promise<void>> = {
    [ApiUrl.Export]: handleExport,
    [ApiUrl.Import]: handleImport,
    [ApiUrl.ClientId]: handleClientId,
    [ApiUrl.CheckUser]: handleCheckUser,
    [ApiUrl.Summary]: handleSummary,
    [ApiUrl.Details]: handleDetails,
    [ApiUrl.DetailsAdd]: handleAdd,
    [ApiUrl.DetailsUpdate]: handleUpdateDetails,
    [ApiUrl.DetailsSetRemoving]: handleSetRemoving,
    [ApiUrl.DetailsSetMissing]: handleSetMissing,
    [ApiUrl.DetailsRename]: handleRename,
    [ApiUrl.DetailsMove]: handleMove,
    [ApiUrl.DetailsDelete]: handleDelete,
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
