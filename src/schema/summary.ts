import z from 'zod';

import { yearAmountsSchema } from '~/schema/amounts';
import { productSchema } from '~/schema/products';

/** Summary projection with optional readonly yearly stock, image references, and a client-only loaded history cache. */
export const summarySchema = productSchema
    .pick({
        group: true,
        name: true,
        history: true,
        image: true,
        photo: true,
    })
    .safeExtend({
        years: z.array(yearAmountsSchema).readonly().optional(),
    });
export type Summary = z.infer<typeof summarySchema>;
