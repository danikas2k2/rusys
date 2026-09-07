import type { VariantAmount, VariantUnits } from '@rusys/common/data';
import type { Update } from '@rusys/common/data';
import { isDevMode, DEV_CLIENT_ID } from '@rusys/common/utils/dev';
import { Router, type Request, type Response } from 'express';
import type { UploadedFile } from 'express-fileupload';

import { getProductsWithYears } from '~/server/api/response';
import {
    deleteGroupOccurrences,
    importEverything,
    moveProductOccurrences,
    renameGroupOccurrences,
    renameVariantOccurrences,
} from '~/server/data/common';
import { buildExportArchive, readImportArchive, writeImportImages } from '~/server/data/exportArchive';
import { getGroups, reorderGroups, updateGroup } from '~/server/data/groups';
import {
    addProduct,
    deleteProduct,
    getProductUndates,
    getProductUpdates,
    moveConsumedToRecycled,
    redoProduct,
    renameProduct,
    setAmounts,
    setImage,
    setMissing,
    setMissingBulk,
    setRemoving,
    setProductExpiryTolerance,
    setProductParent,
    setVariantImage,
    undoProduct,
} from '~/server/data/products';
import { getValidator } from '~/server/data/schema/getValidator';
import { getFullSummary, getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';
import { copyVariant, deleteVariant, getVariants, reorderVariants, updateVariant } from '~/server/data/variants';

const cacheControl = 'no-cache, no-store, must-revalidate';
const variantUnits = new Set<VariantUnits>(['g', 'kg', 'l', 'ml', 'vnt']);

type Json = Record<string, unknown>;

function sendError(res: Response, status: number, code: string, message: string): void {
    res.status(status).json({ error: { code, message } });
}

function requiredParam(req: Request, res: Response, name: string): string | undefined {
    const value = req.params[name];
    if (typeof value !== 'string' || !value) {
        sendError(res, 400, 'VALIDATION_ERROR', `${name} is required`);
        return undefined;
    }
    return value;
}

function requiredYear(req: Request, res: Response): number | undefined {
    const value = Number(req.params.year);
    if (!Number.isInteger(value)) {
        sendError(res, 400, 'VALIDATION_ERROR', 'year must be an integer');
        return undefined;
    }
    return value;
}

function isVariantUnits(value: unknown): value is VariantUnits {
    return typeof value === 'string' && variantUnits.has(value as VariantUnits);
}

async function respond(res: Response, action: () => Promise<boolean>, body?: () => Promise<Json>): Promise<void> {
    try {
        if (!(await action())) {
            sendError(res, 422, 'OPERATION_REJECTED', 'The requested change could not be applied');
            return;
        }
        res.status(body ? 200 : 204).json(body ? await body() : undefined);
    } catch (error) {
        sendError(res, 500, 'INTERNAL_ERROR', `${error}`);
    }
}

async function importArchive(file: UploadedFile): Promise<boolean> {
    const archive = await readImportArchive(file.data);
    const validate = getValidator();
    if (!validate(archive.data)) {
        throw new Error('Invalid file content');
    }
    await writeImportImages(archive.images);
    const { data } = archive;
    return importEverything(
        data.products.map((product) => ({
            ...product,
            updates: (product.updates as Update[] | undefined)?.map((update) => ({
                ...update,
                time: new Date(update.time).getTime(),
            })),
        })),
        data.variants,
        data.groups
    );
}

/**
 * The v1 router deliberately does not reuse legacy handlers: those handlers encode every
 * failure in a 200 response. Both APIs stay mounted during the client migration.
 */
export function createV1Router(): Router {
    const router = Router();
    router.use((_, res, next) => {
        res.setHeader('Cache-Control', cacheControl);
        next();
    });

    router.get('/auth/client-id', (_req, res) => {
        const clientId = process.env.GOOGLE_CLIENT_ID ?? (isDevMode() ? DEV_CLIENT_ID : undefined);
        if (!clientId) {
            sendError(res, 503, 'CONFIGURATION_ERROR', 'Google client ID is not configured');
            return;
        }
        res.json({ clientId });
    });

    router.get('/access', (req, res) => {
        const email = typeof req.query.email === 'string' ? req.query.email : undefined;
        if (!email) {
            sendError(res, 400, 'VALIDATION_ERROR', 'email is required');
            return;
        }
        const allowed = process.env.GOOGLE_ALLOWED_USERS?.split(',').includes(email) || isDevMode();
        res.json({ allowed });
    });

    router.get('/user-profiles', async (req, res) => {
        const emails = (Array.isArray(req.query.email) ? req.query.email : [req.query.email]).filter(
            (email): email is string => typeof email === 'string'
        );
        res.json({ profiles: await getUserProfiles(emails) });
    });

    router.put('/user-profiles/:email', async (req, res) => {
        const email = requiredParam(req, res, 'email');
        if (!email) {
            return;
        }
        const { name, picture } = req.body as { name?: unknown; picture?: unknown };
        if ((name != null && typeof name !== 'string') || (picture != null && typeof picture !== 'string')) {
            sendError(res, 400, 'VALIDATION_ERROR', 'name and picture must be strings');
            return;
        }
        await respond(res, () =>
            upsertUserProfile(
                email,
                typeof name === 'string' ? name : undefined,
                typeof picture === 'string' ? picture : undefined
            )
        );
    });

    router.get('/groups', async (_req, res) => res.json({ groups: await getGroups() }));
    router.put('/groups/:group', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        if (!group) {
            return;
        }
        const { annual, review, image } = req.body as { annual?: unknown; review?: unknown; image?: unknown };
        if (
            (annual != null && typeof annual !== 'boolean') ||
            (review != null && typeof review !== 'boolean') ||
            (image != null && typeof image !== 'string')
        ) {
            sendError(res, 400, 'VALIDATION_ERROR', 'annual and review must be booleans; image must be a string');
            return;
        }
        await respond(res, () =>
            updateGroup(
                group,
                typeof annual === 'boolean' ? annual : true,
                typeof review === 'boolean' ? review : false,
                typeof image === 'string' ? image : undefined
            )
        );
    });
    router.patch('/groups/:group', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        if (!group) {
            return;
        }
        const { name, annual, review, image } = req.body as {
            name?: unknown;
            annual?: unknown;
            review?: unknown;
            image?: unknown;
        };
        if (
            (name != null && typeof name !== 'string') ||
            (annual != null && typeof annual !== 'boolean') ||
            (review != null && typeof review !== 'boolean') ||
            (image != null && typeof image !== 'string')
        ) {
            sendError(
                res,
                400,
                'VALIDATION_ERROR',
                'name and image must be strings; annual and review must be booleans'
            );
            return;
        }
        const current = (await getGroups()).find((item) => item.group === group);
        if (!current) {
            sendError(res, 404, 'NOT_FOUND', 'Group not found');
            return;
        }
        const nextAnnual = typeof annual === 'boolean' ? annual : current.annual;
        const nextReview = typeof review === 'boolean' ? review : current.review;
        const nextImage = typeof image === 'string' ? image : current.image;
        await respond(res, () =>
            typeof name === 'string' && name !== group
                ? renameGroupOccurrences(group, name, nextAnnual, nextReview, nextImage)
                : updateGroup(group, nextAnnual, nextReview, nextImage)
        );
    });
    router.delete('/groups/:group', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        if (!group) {
            return;
        }
        await respond(res, () => deleteGroupOccurrences(group));
    });
    router.put('/groups/order', async (req, res) => {
        const { groups } = req.body as { groups?: Readonly<Record<string, number>> };
        if (!groups) {
            sendError(res, 400, 'VALIDATION_ERROR', 'groups is required');
            return;
        }
        await respond(res, () => reorderGroups(groups));
    });
    router.get('/variants', async (req, res) => {
        const group = typeof req.query.group === 'string' ? req.query.group : undefined;
        const variants = await getVariants();
        res.json({ variants: group ? variants.filter((variant) => variant.group === group) : variants });
    });
    router.delete('/groups/:group/variants/:variant', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const variant = requiredParam(req, res, 'variant');
        if (!group || !variant) {
            return;
        }
        await respond(res, () => deleteVariant(group, variant));
    });
    router.patch('/groups/:group/variants/:variant', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const variant = requiredParam(req, res, 'variant');
        if (!group || !variant) {
            return;
        }
        const { name, order, suffix, count, units } = req.body as {
            name?: unknown;
            order?: unknown;
            suffix?: unknown;
            count?: unknown;
            units?: unknown;
        };
        if (
            (name != null && typeof name !== 'string') ||
            (order != null && typeof order !== 'number') ||
            (suffix != null && typeof suffix !== 'string') ||
            (count != null && typeof count !== 'number') ||
            (units != null && !isVariantUnits(units))
        ) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Variant fields have invalid types');
            return;
        }
        const current = (await getVariants()).find((item) => item.group === group && item.variant === variant);
        if (!current) {
            sendError(res, 404, 'NOT_FOUND', 'Variant not found');
            return;
        }
        const update = {
            order: typeof order === 'number' ? order : current.order,
            suffix: typeof suffix === 'string' ? suffix : current.suffix,
            count: typeof count === 'number' ? count : current.count,
            units: isVariantUnits(units) ? units : current.units,
        };
        try {
            const renamed = typeof name === 'string' && name !== variant;
            if (renamed && !(await renameVariantOccurrences(group, variant, name, update))) {
                sendError(res, 409, 'CONFLICT', 'The variant could not be renamed');
                return;
            }
            if (!renamed && !(await updateVariant(group, variant, update))) {
                sendError(res, 422, 'OPERATION_REJECTED', 'The requested change could not be applied');
                return;
            }
            res.status(204).end();
        } catch (error) {
            sendError(res, 500, 'INTERNAL_ERROR', `${error}`);
        }
    });
    router.post('/groups/:group/variants/:variant/copies', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const variant = requiredParam(req, res, 'variant');
        const { newGroup, newVariant, order, suffix, count, units } = req.body as {
            newGroup?: string;
            newVariant?: string;
            order?: number;
            suffix?: string;
            count?: number;
            units?: VariantUnits;
        };
        if (!group || !variant || !newGroup) {
            sendError(res, 400, 'VALIDATION_ERROR', 'newGroup is required');
            return;
        }
        await respond(res, () => copyVariant(group, variant, newGroup, newVariant, { order, suffix, count, units }));
    });
    router.put('/groups/:group/variants/order', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const { variants } = req.body as { variants?: Readonly<Record<string, number>> };
        if (!group || !variants) {
            sendError(res, 400, 'VALIDATION_ERROR', 'variants is required');
            return;
        }
        await respond(res, () => reorderVariants(group, variants));
    });
    router.get('/products', async (_req, res) => res.json(await getProductsWithYears()));
    router.get('/summary', async (_req, res) => res.json(await getFullSummary()));

    router.get('/exports/latest', async (_req, res) => {
        try {
            const archive = await buildExportArchive();
            const filename = `${new Date().toISOString().slice(0, 10)}.zip`;
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(archive);
        } catch (error) {
            sendError(res, 500, 'INTERNAL_ERROR', `${error}`);
        }
    });

    router.post('/imports', async (req, res) => {
        const received = req.files?.import;
        if (!received || Array.isArray(received)) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Exactly one import file is required');
            return;
        }
        try {
            if (!(await importArchive(received))) {
                sendError(res, 422, 'OPERATION_REJECTED', 'The archive could not be imported');
                return;
            }
            res.status(204).end();
        } catch (error) {
            sendError(res, 400, 'INVALID_IMPORT', `${error}`);
        }
    });

    router.post('/products', async (req, res) => {
        const { group, name, parent } = req.body as { group?: string; name?: string; parent?: string };
        if (!group || !name) {
            sendError(res, 400, 'VALIDATION_ERROR', 'group and name are required');
            return;
        }
        try {
            if (!(await addProduct(group, name, parent))) {
                sendError(res, 409, 'CONFLICT', 'The product already exists or could not be created');
                return;
            }
            res.status(201)
                .location(`/api/v1/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}`)
                .end();
        } catch (error) {
            sendError(res, 500, 'INTERNAL_ERROR', `${error}`);
        }
    });

    router.patch('/groups/:group/products/review-statuses', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const { updates } = req.body as { updates?: readonly { name: string; missing: boolean }[] };
        if (!group || !updates?.length || updates.some(({ name, missing }) => !name || typeof missing !== 'boolean')) {
            sendError(res, 400, 'VALIDATION_ERROR', 'updates must contain name and missing for each product');
            return;
        }
        await respond(res, () => setMissingBulk(updates.map((update) => ({ ...update, group }))));
    });

    router.delete('/groups/:group/products/:name', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        if (!group || !name) {
            return;
        }
        await respond(res, () => deleteProduct(group, name));
    });

    router.patch('/groups/:group/products/:name', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        if (!group || !name) {
            return;
        }
        const body = req.body as {
            name?: unknown;
            group?: unknown;
            newName?: unknown;
            parent?: unknown;
            expiryToleranceDays?: unknown;
            missing?: unknown;
        };
        const fields = ['name', 'group', 'parent', 'expiryToleranceDays', 'missing'].filter((field) => field in body);
        if (fields.length !== 1) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Exactly one product field must be changed per request');
            return;
        }
        const [field] = fields;
        switch (field) {
            case 'name': {
                const newName = body.name;
                if (typeof newName !== 'string') {
                    sendError(res, 400, 'VALIDATION_ERROR', 'name must be a string');
                    return;
                }
                await respond(res, () => renameProduct(group, name, newName));
                return;
            }
            case 'group': {
                const newGroup = body.group;
                const newName = body.newName;
                if (typeof newGroup !== 'string' || (newName != null && typeof newName !== 'string')) {
                    sendError(res, 400, 'VALIDATION_ERROR', 'group and newName must be strings');
                    return;
                }
                await respond(res, () => moveProductOccurrences(group, name, newGroup, newName ?? undefined));
                return;
            }
            case 'parent': {
                const parent = body.parent;
                if (parent != null && typeof parent !== 'string') {
                    sendError(res, 400, 'VALIDATION_ERROR', 'parent must be a string or null');
                    return;
                }
                await respond(res, () => setProductParent(group, name, parent ?? undefined));
                return;
            }
            case 'expiryToleranceDays': {
                const expiryToleranceDays = body.expiryToleranceDays;
                if (
                    typeof expiryToleranceDays !== 'number' ||
                    !Number.isInteger(expiryToleranceDays) ||
                    expiryToleranceDays < 0
                ) {
                    sendError(res, 400, 'VALIDATION_ERROR', 'expiryToleranceDays must be a non-negative integer');
                    return;
                }
                await respond(res, () => setProductExpiryTolerance(group, name, expiryToleranceDays));
                return;
            }
            default: {
                const missing = body.missing;
                if (typeof missing !== 'boolean') {
                    sendError(res, 400, 'VALIDATION_ERROR', 'missing must be a boolean');
                    return;
                }
                await respond(res, () => setMissing(group, name, missing));
            }
        }
    });

    router.put('/groups/:group/products/:name/image', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const { image } = req.body as { image?: string };
        if (!group || !name || typeof image !== 'string') {
            sendError(res, 400, 'VALIDATION_ERROR', 'image is required');
            return;
        }
        await respond(res, () => setImage(group, name, image));
    });

    router.put('/groups/:group/products/:name/variants/:variant/image', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const variant = requiredParam(req, res, 'variant');
        const { image } = req.body as { image?: string };
        if (!group || !name || !variant || typeof image !== 'string') {
            sendError(res, 400, 'VALIDATION_ERROR', 'image is required');
            return;
        }
        await respond(res, () => setVariantImage(group, name, variant, image));
    });

    router.put('/groups/:group/products/:name/years/:year/amounts', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        const { amounts, user, comment } = req.body as {
            amounts?: readonly VariantAmount[];
            user?: string;
            comment?: string;
        };
        if (!group || !name || year == null || !amounts?.length) {
            sendError(res, 400, 'VALIDATION_ERROR', 'amounts is required');
            return;
        }
        await respond(res, () => setAmounts(group, name, year, amounts, user, comment));
    });

    router.patch('/groups/:group/products/:name/years/:year', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        const { removing } = req.body as { removing?: unknown };
        if (!group || !name || year == null || typeof removing !== 'boolean') {
            sendError(res, 400, 'VALIDATION_ERROR', 'removing must be a boolean');
            return;
        }
        await respond(res, () => setRemoving(group, name, year, removing));
    });

    router.post('/groups/:group/products/:name/years/:year/amount-history', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        const { variant, amount, suspicious, home, expiresAt, user } = req.body as {
            variant?: string;
            amount?: number;
            suspicious?: boolean;
            home?: boolean;
            expiresAt?: number;
            user?: string;
        };
        if (!group || !name || year == null || !variant || !(amount && amount > 0)) {
            sendError(res, 400, 'VALIDATION_ERROR', 'variant and a positive amount are required');
            return;
        }
        await respond(res, () =>
            moveConsumedToRecycled(group, name, year, variant, amount, { suspicious, home, expiresAt }, user)
        );
    });

    router.post('/groups/:group/products/:name/years/:year/amount-history/undo', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        if (!group || !name || year == null) {
            return;
        }
        await respond(res, () => undoProduct(group, name, year));
    });

    router.post('/groups/:group/products/:name/years/:year/amount-history/redo', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        if (!group || !name || year == null) {
            return;
        }
        await respond(res, () => redoProduct(group, name, year));
    });

    router.get('/groups/:group/products/:name/years/:year/history', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        if (!group || !name || year == null) {
            return;
        }
        res.json({
            updates: await getProductUpdates(group, name, year),
            undates: await getProductUndates(group, name, year),
        });
    });

    router.get('/groups/:group/products/:name/years/:year/summary-history', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        if (!group || !name || year == null) {
            return;
        }
        res.json({
            updates: await getSummaryUpdates(group, name, year),
            undates: await getSummaryUndates(group, name, year),
        });
    });

    return router;
}
