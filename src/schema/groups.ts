import z from 'zod';

import { SchemaError } from '~/schema/errors';

export const validGroupName = z
    .string(SchemaError.CategoryInvalid)
    .trim()
    .nonempty(SchemaError.CategoryRequired)
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);

export const groupIdentity = z.strictObject({ group: validGroupName });
export type GroupIdentity = z.infer<typeof groupIdentity>;

export const updateGroup = groupIdentity.safeExtend({
    annual: z.boolean().optional(),
    review: z.boolean().optional(),
    image: z.string().optional(),
});
export type UpdateGroup = z.infer<typeof updateGroup>;

export const renameGroup = updateGroup.safeExtend({ targetGroup: validGroupName });
export type RenameGroup = z.infer<typeof renameGroup>;

export const deleteGroup = z.strictObject({ group: validGroupName });
export type DeleteGroup = z.infer<typeof deleteGroup>;

export const reorderGroups = z.strictObject({
    groups: z.record(validGroupName, z.number()).refine((value) => Object.keys(value).length > 0),
});
export type ReorderGroups = z.infer<typeof reorderGroups>;
