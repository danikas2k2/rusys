import type { Request, Response } from 'express';

import { getVariants } from '~/server/data/variants';

export async function handleGetVariants(req: Request, res: Response): Promise<void> {
    const group = typeof req.query.group === 'string' ? req.query.group : undefined;
    const variants = await getVariants();
    res.json({ variants: group ? variants.filter((variant) => variant.group === group) : variants });
}
