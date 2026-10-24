import z from 'zod';

import { SchemaError } from '~/schema/errors';

/** Trims a group name, requires a nonempty result, and forbids the `:` identity separator. */
export const validGroupName = z
    .string(SchemaError.CategoryInvalid)
    .trim()
    .nonempty(SchemaError.CategoryRequired)
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);

/** Identifies a group by its normalized name; rejects unknown request fields. */
export const groupIdentitySchema = z.strictObject({ group: validGroupName });
export type GroupIdentity = z.infer<typeof groupIdentitySchema>;

/** Group document/projection; stored strings and optional settings are preserved without request normalization/defaults. */
export const groupSchema = groupIdentitySchema.safeExtend({
    order: z.number(),
    annual: z.boolean().optional(),
    review: z.boolean().optional(),
    image: z.string().optional(),
    photo: z.string().optional(),
    /** An archived group also makes its products and variants unavailable for new work. */
    archivedAt: z.number().optional(),
});
export type Group = z.infer<typeof groupSchema>;

/**
 * Group create/update request with optional annual/review booleans and an image string (empty is allowed).
 * Omitted settings stay omitted during parsing; defaults and image handling belong to the data layer.
 */
export const updateGroupSchema = groupSchema.pick({
    group: true,
    annual: true,
    review: true,
    image: true,
});
export type UpdateGroup = z.infer<typeof updateGroupSchema>;

/** Renames a group to a required normalized target name, optionally updating its settings too. */
export const renameGroupSchema = updateGroupSchema.safeExtend({ targetGroup: validGroupName });
export type RenameGroup = z.infer<typeof renameGroupSchema>;

/** Group deletion request containing only the normalized group identity. */
export const deleteGroupSchema = groupIdentitySchema.clone();
export type DeleteGroup = z.infer<typeof deleteGroupSchema>;

/**
 * Requires at least one normalized group-name-to-order entry and rejects unknown top-level fields.
 * Orders are finite numbers; integer, non-negative, contiguous, and unique positions are not required.
 */
export const reorderGroupsSchema = z.strictObject({
    groups: z.record(validGroupName, z.number()).refine((value) => Object.keys(value).length > 0),
});
export type ReorderGroups = z.infer<typeof reorderGroupsSchema>;
