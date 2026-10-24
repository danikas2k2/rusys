import z from 'zod';

import { MAX_IMPORT_FILE_SIZE } from '~/common/utils/files';
import { SchemaError } from '~/schema/errors';
import { groupSchema } from '~/schema/groups';
import { productSchema } from '~/schema/products';
import { variantSchema } from '~/schema/variants';

/**
 * In-memory archive data shape with readonly product, variant, and group lists; empty collections are allowed.
 * Serialized imports use serializedArchiveDataSchema to preserve the separate legacy wire format.
 */
export const exportArchiveDataSchema = z.object({
    products: z.array(productSchema).readonly(),
    variants: z.array(variantSchema).readonly(),
    groups: z.array(groupSchema).readonly(),
});
export type ExportArchiveData = z.infer<typeof exportArchiveDataSchema>;

/** Legacy JSON integers may exceed the safe-integer range; preserve the former JSON Schema integer semantics. */
const archiveInteger = z.number().refine(Number.isInteger);

/** Legacy audit time accepts integer milliseconds or the original ISO-shaped string, without calendar validation. */
const archiveTime = z.union([
    archiveInteger,
    z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/),
]);

/** Legacy stock row: quantities are integers; older exports may contain explicit null metadata flags. */
const archiveAmount = z.strictObject({
    variant: z.string(),
    amount: archiveInteger,
    recycled: z.boolean().optional(),
    suspicious: z.boolean().nullable().optional(),
    home: z.boolean().nullable().optional(),
    expiresAt: archiveInteger.nullable().optional(),
});

/** History year with optional/nullable amount rows; year values have no calendar-year lower bound. */
const archiveHistoryYear = z.strictObject({
    year: archiveInteger,
    amounts: z.array(archiveAmount).nullable().optional(),
});

/** Current stock years additionally permit the optional removing flag, which history year rows do not accept. */
const archiveStockYear = archiveHistoryYear.extend({ removing: z.boolean().optional() });

/** Legacy audit entry requires years even when null; optional audit strings are preserved without normalization. */
const archiveUpdate = z.strictObject({
    time: archiveTime,
    user: z.string().optional(),
    comment: z.string().optional(),
    years: z.array(archiveHistoryYear).nullable(),
});

/** Validate every own JSON map value, including __proto__, without dropping keys or transforming the map. */
const archiveImageMap = z.custom<Record<string, string>>(
    (value) =>
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.values(value).every((entry: unknown) => typeof entry === 'string')
);

/** Legacy image-check maps have the same key semantics as image maps, with boolean values instead of strings. */
const archiveImageChecks = z.custom<Record<string, boolean>>(
    (value) =>
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.values(value).every((entry: unknown) => typeof entry === 'boolean')
);

/** Product wire format retains legacy image-check metadata and nullable stock/history collections. */
const archiveProduct = z.strictObject({
    group: z.string(),
    name: z.string(),
    parent: z.string().optional(),
    years: z.array(archiveStockYear).nullable().optional(),
    updates: z.array(archiveUpdate).nullable().optional(),
    undates: z.array(archiveUpdate).nullable().optional(),
    missing: z.boolean().optional(),
    image: z.string().optional(),
    photo: z.string().optional(),
    variantImages: archiveImageMap.optional(),
    variantPhotos: archiveImageMap.optional(),
    imageChecked: z.boolean().optional(),
    variantImagesChecked: archiveImageChecks.optional(),
    archivedAt: archiveInteger.optional(),
});

/** Group wire format requires an integer order and permits optional settings, images, and an integer archive time. */
const archiveGroup = z.strictObject({
    group: z.string(),
    order: archiveInteger,
    annual: z.boolean().optional(),
    review: z.boolean().optional(),
    image: z.string().optional(),
    photo: z.string().optional(),
    archivedAt: archiveInteger.optional(),
});

/** Variant wire format permits any string unit and finite count, independently of current creation-form limits. */
const archiveVariant = z.strictObject({
    group: z.string(),
    variant: z.string(),
    order: archiveInteger,
    suffix: z.string().optional(),
    count: z.number().optional(),
    units: z.string().optional(),
    archivedAt: archiveInteger.optional(),
});

/**
 * Legacy data.json import contract: all three arrays are required, empty arrays are valid, and unknown fields
 * are rejected at every fixed-shape object level. Names and legacy metadata remain verbatim.
 * After validation, product update times become milliseconds; missing/null updates become undefined.
 * Undo history is preserved. ISO-shaped invalid dates retain the importer's previous NaN conversion behavior.
 */
export const serializedArchiveDataSchema = z
    .strictObject({
        products: z.array(archiveProduct),
        groups: z.array(archiveGroup),
        variants: z.array(archiveVariant),
    })
    .transform((data) => ({
        ...data,
        products: data.products.map((product) => ({
            ...product,
            updates: product.updates?.map((update) => ({
                ...update,
                time: new Date(update.time).getTime(),
            })),
        })),
    }));
/** Legacy wire input before update timestamp conversion; separate from modern application model types. */
export type SerializedArchiveInput = z.input<typeof serializedArchiveDataSchema>;
/** Validated import payload ready for persistence, with product update timestamps already converted. */
export type SerializedArchiveData = z.output<typeof serializedArchiveDataSchema>;

/**
 * Accepts FormData containing exactly one `import` File and returns that File.
 * Rejects other fields and files above MAX_IMPORT_FILE_SIZE; ZIP contents are checked by the import handler.
 */
export const importArchiveSchema = z
    .instanceof(FormData, { error: SchemaError.InvalidZipFile })
    .transform((data, ctx) => {
        const files = data.getAll('import');
        if (files.length !== 1 || [...data.keys()].some((key) => key !== 'import')) {
            ctx.addIssue({ code: 'custom', message: SchemaError.ImportFileRequired });
            return z.NEVER;
        }
        const [file] = files;
        if (!(file instanceof File) || file.size > MAX_IMPORT_FILE_SIZE) {
            ctx.addIssue({ code: 'custom', message: SchemaError.InvalidZipFile });
            return z.NEVER;
        }
        return file;
    });

/** Request input is FormData; successful parsing produces a File. */
export type ImportArchive = z.input<typeof importArchiveSchema>;
