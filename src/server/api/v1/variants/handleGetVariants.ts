import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { getVariants } from '~/server/data/variants';

export async function handleGetVariants(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = typeof req.query.group === 'string' ? req.query.group : undefined;
    const variants = await getVariants();
    res.json({ variants: group ? variants.filter((variant) => variant.group === group) : variants });
}
