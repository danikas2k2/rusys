import z from 'zod';

/** Stored/public profile shape; email and picture remain plain strings, with identity verification handled elsewhere. */
export const userProfileSchema = z.object({
    email: z.string(),
    name: z.string().optional(),
    picture: z.string().optional(),
    updatedAt: z.number().optional(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;
