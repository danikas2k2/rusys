import z from 'zod';

import { SchemaError } from '~/schema/errors';

/** Trims a group name, requires a nonempty result, and forbids the `:` identity separator. */
export const validGroupName = z
    .string(SchemaError.CategoryInvalid)
    .trim()
    .nonempty(SchemaError.CategoryRequired)
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);

/** Identifies a group by its normalized name; rejects unknown request fields. */
export const groupIdentity = z.strictObject({ group: validGroupName });
export type GroupIdentity = z.infer<typeof groupIdentity>;

/**
 * Group create/update request with optional annual/review booleans and an image string (empty is allowed).
 * Omitted settings stay omitted during parsing; defaults and image handling belong to the data layer.
 */
export const updateGroup = groupIdentity.safeExtend({
    annual: z.boolean().optional(),
    review: z.boolean().optional(),
    image: z.string().optional(),
});
export type UpdateGroup = z.infer<typeof updateGroup>;

/** Renames a group to a required normalized target name, optionally updating its settings too. */
export const renameGroup = updateGroup.safeExtend({ targetGroup: validGroupName });
export type RenameGroup = z.infer<typeof renameGroup>;

/** Group deletion request containing only the normalized group identity. */
export const deleteGroup = z.strictObject({ group: validGroupName });
export type DeleteGroup = z.infer<typeof deleteGroup>;

/**
 * Requires at least one normalized group-name-to-order entry and rejects unknown top-level fields.
 * Orders are finite numbers; integer, non-negative, contiguous, and unique positions are not required.
 */
export const reorderGroups = z.strictObject({
    groups: z.record(validGroupName, z.number()).refine((value) => Object.keys(value).length > 0),
});
export type ReorderGroups = z.infer<typeof reorderGroups>;
