import type { Router } from 'express';

import { getVariants } from '~/server/data/variants';

export function registerGetVariantsHandler(router: Router): void {
    router.get('/variants', async (req, res) => {
        const group = typeof req.query.group === 'string' ? req.query.group : undefined;
        const variants = await getVariants();
        res.json({ variants: group ? variants.filter((variant) => variant.group === group) : variants });
    });
}
