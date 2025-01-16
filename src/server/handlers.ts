import { type ApiRequest, type ApiResponse, ApiUrl } from '~/common/api';
import { handleAdd } from '~/server/app/handleAdd';
import { handleCheckUser } from '~/server/app/handleCheckUser';
import { handleClientId } from '~/server/app/handleClientId';
import { handleCopyVariant } from '~/server/app/handleCopyVariant';
import { handleDelete } from '~/server/app/handleDelete';
import { handleDeleteGroup } from '~/server/app/handleDeleteGroup';
import { handleDeleteVariant } from '~/server/app/handleDeleteVariant';
import { handleDetails } from '~/server/app/handleDetails';
import { handleExport } from '~/server/app/handleExport';
import { handleGroups } from '~/server/app/handleGroups';
import { handleImport } from '~/server/app/handleImport';
import { handleMove } from '~/server/app/handleMove';
import { handleRename } from '~/server/app/handleRename';
import { handleRenameGroup } from '~/server/app/handleRenameGroup';
import { handleRenameVariant } from '~/server/app/handleRenameVariant';
import { handleReorderGroups } from '~/server/app/handleReorderGroups';
import { handleReorderVariants } from '~/server/app/handleReorderVariants';
import { handleSetMissing } from '~/server/app/handleSetMissing';
import { handleSetRemoving } from '~/server/app/handleSetRemoving';
import { handleSummary } from '~/server/app/handleSummary';
import { handleUpdateDetails } from '~/server/app/handleUpdateDetails';
import { handleUpdateGroup } from '~/server/app/handleUpdateGroup';
import { handleUpdateVariant } from '~/server/app/handleUpdateVariant';
import { handleVariants } from '~/server/app/handleVariants';

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
